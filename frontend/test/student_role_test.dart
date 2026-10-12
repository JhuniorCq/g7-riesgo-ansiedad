import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:ansiedad_ml_app/core/constants.dart';
import 'package:ansiedad_ml_app/data/datasources/local/secure_session_store.dart';
import 'package:ansiedad_ml_app/data/datasources/remote/api_service.dart';
import 'package:ansiedad_ml_app/data/datasources/remote/auth_remote_datasource.dart';
import 'package:ansiedad_ml_app/data/models/usuario_model.dart';
import 'package:ansiedad_ml_app/data/repositories/auth_repository_impl.dart';
import 'package:ansiedad_ml_app/domain/entities/usuario.dart';
import 'package:ansiedad_ml_app/domain/services/session_store.dart';
import 'package:ansiedad_ml_app/domain/usecases/login_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/register_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/logout_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/restaurar_sesion_usecase.dart';
import 'package:ansiedad_ml_app/presentation/pages/auth/login_screen.dart';
import 'package:ansiedad_ml_app/presentation/pages/auth/session_gate.dart';
import 'package:ansiedad_ml_app/presentation/viewmodels/auth_viewmodel.dart';
import 'fake_session_store.dart';

const student = <String, dynamic>{
  'id': 1,
  'names': 'Ana',
  'surnames': 'Perez',
  'code': '001',
  'email': 'test@example.com',
  'school': 'Sistemas',
  'cycle': 9,
  'createdAt': '2026-10-12T00:00:00Z',
  'role': 'ESTUDIANTE',
};

class RoleStore extends FakeSessionStore {
  int writes = 0;
  int deletes = 0;
  @override
  Future<void> write(StoredSession value) async {
    writes++;
    await super.write(value);
  }

  @override
  Future<void> delete() async {
    deletes++;
    await super.delete();
  }
}

AuthViewModel auth(ApiService api, SessionStore store) {
  final repo = AuthRepositoryImpl(AuthRemoteDataSource(api), store);
  return AuthViewModel(
    LoginUseCase(repo),
    RegisterUseCase(repo),
    LogoutUseCase(repo),
    RestaurarSesionUseCase(repo),
  );
}

void main() {
  test('modelo conserva el rol en todos sus mapeos', () {
    final model = UsuarioModel.fromJson(student);
    expect(model.toEntity().role, 'ESTUDIANTE');
    expect(model.toEntity().isStudent, isTrue);
    expect(UsuarioModel.fromEntity(model.toEntity()).toJson(), student);
  });

  final invalid = <String, Object?>{
    'administrador': 'ADMINISTRADOR',
    'personal': 'PERSONAL_UNAYOE',
    'desconocido': 'OTHER',
    'ausente': null,
    'nulo': null,
    'numero': 1,
    'booleano': true,
    'objeto': {'role': 'ESTUDIANTE'},
    'minusculas': 'estudiante',
    'espacios': 'ESTUDIANTE ',
  };
  for (final item in invalid.entries) {
    test(
      'login rechaza rol ${item.key} sin persistir ni publicar Bearer',
      () async {
        final user = {...student, 'role': item.value};
        if (item.key == 'ausente') user.remove('role');
        final store = RoleStore();
        final api = ApiService();
        final vm = auth(api, store);
        await http.runWithClient(
          () async {
            expect(await vm.login('test@example.com', 'fixture'), isFalse);
            expect(vm.error, Usuario.studentAccessMessage);
            expect(vm.isAuthenticated, isFalse);
            expect(vm.usuario, isNull);
            expect(vm.token, isNull);
            expect(store.writes, 0);
            expect(store.session, isNull);
            await api.get('http://local/check');
          },
          () => MockClient((request) async {
            if (request.method == 'POST') {
              return http.Response(
                jsonEncode({'user': user, 'accessToken': 'fixture'}),
                200,
              );
            }
            expect(request.headers.containsKey('Authorization'), isFalse);
            return http.Response('{}', 200);
          }),
        );
        vm.dispose();
      },
    );
  }

  test(
    'login estudiante persiste rol y restaura estudiante revalidado',
    () async {
      final store = RoleStore();
      await http.runWithClient(
        () async {
          final vm = auth(ApiService(), store);
          expect(await vm.login('test@example.com', 'fixture'), isTrue);
          expect(store.session!.role, 'ESTUDIANTE');
          expect(store.writes, 1);
          vm.dispose();
          final restored = auth(ApiService(), store);
          await restored.restaurarSesion();
          expect(restored.isAuthenticated, isTrue);
          expect(restored.usuario!.role, 'ESTUDIANTE');
          restored.dispose();
        },
        () => MockClient(
          (request) async => http.Response(
            jsonEncode(
              request.method == 'POST'
                  ? {'user': student, 'accessToken': 'fixture'}
                  : student,
            ),
            200,
          ),
        ),
      );
    },
  );

  for (final role in [
    null,
    'ADMINISTRADOR',
    'PERSONAL_UNAYOE',
    'OTHER',
    'ESTUDIANTE ',
  ]) {
    test(
      'restauracion elimina rol local no permitido $role sin consultar backend',
      () async {
        final store = RoleStore()
          ..session = StoredSession('fixture', AppConstants.usersOrigin, role);
        var calls = 0;
        await http.runWithClient(
          () async {
            final vm = auth(ApiService(), store);
            await vm.restaurarSesion();
            expect(vm.isAuthenticated, isFalse);
            expect(vm.restoreError, isNull);
            expect(store.session, isNull);
            expect(store.deletes, 1);
            vm.dispose();
          },
          () => MockClient((_) async {
            calls++;
            return http.Response('{}', 200);
          }),
        );
        expect(calls, 0);
      },
    );
  }

  for (final item in invalid.entries) {
    test('restauracion revoca rol remoto ${item.key}', () async {
      final user = {...student, 'role': item.value};
      if (item.key == 'ausente') user.remove('role');
      final store = RoleStore()
        ..session = StoredSession(
          'fixture',
          AppConstants.usersOrigin,
          'ESTUDIANTE',
        );
      await http.runWithClient(() async {
        final vm = auth(ApiService(), store);
        await vm.restaurarSesion();
        expect(vm.isAuthenticated, isFalse);
        expect(vm.usuario, isNull);
        expect(store.session, isNull);
        expect(store.deletes, 1);
        vm.dispose();
      }, () => MockClient((_) async => http.Response(jsonEncode(user), 200)));
    });
  }

  test(
    'fallo de conexion o servidor conserva almacenamiento sin conceder acceso',
    () async {
      for (final failure in [
        TimeoutException('fixture'),
        http.ClientException('fixture'),
        null,
      ]) {
        final store = RoleStore()
          ..session = StoredSession(
            'fixture',
            AppConstants.usersOrigin,
            'ESTUDIANTE',
          );
        await http.runWithClient(
          () async {
            final vm = auth(ApiService(), store);
            await vm.restaurarSesion();
            expect(vm.isAuthenticated, isFalse);
            expect(vm.restoreError, isNotNull);
            expect(store.session, isNotNull);
            expect(store.deletes, 0);
            vm.dispose();
          },
          () => MockClient((_) async {
            if (failure != null) throw failure;
            return http.Response('{"message":"Unavailable"}', 500);
          }),
        );
      }
    },
  );

  test(
    'almacenamiento seguro conserva rol y permite invalidar registro antiguo',
    () async {
      FlutterSecureStorage.setMockInitialValues({});
      const store = SecureSessionStore();
      await store.write(
        StoredSession('fixture', AppConstants.usersOrigin, 'ESTUDIANTE'),
      );
      expect((await store.read())!.role, 'ESTUDIANTE');
      FlutterSecureStorage.setMockInitialValues({
        'users_session_v1': jsonEncode({
          'token': 'old',
          'origin': AppConstants.usersOrigin,
        }),
      });
      final vm = auth(ApiService(), store);
      await vm.restaurarSesion();
      expect(vm.isAuthenticated, isFalse);
      expect(await store.read(), isNull);
      vm.dispose();
    },
  );

  testWidgets(
    'login rechazado no navega a Home y ruta protegida sigue bloqueada',
    (tester) async {
      final store = RoleStore();
      final vm = auth(ApiService(), store);
      await http.runWithClient(
        () async {
          await tester.pumpWidget(
            ChangeNotifierProvider.value(
              value: vm,
              child: MaterialApp(
                home: const LoginScreen(),
                routes: {
                  '/home': (_) => const SessionProtected(
                    child: Scaffold(body: Text('PRIVATE HOME')),
                  ),
                },
              ),
            ),
          );
          await tester.enterText(
            find.byType(TextFormField).at(0),
            'test@example.com',
          );
          await tester.enterText(find.byType(TextFormField).at(1), 'fixture');
          final button = find.byType(ElevatedButton).first;
          await tester.ensureVisible(button);
          await tester.tap(button);
          await tester.pumpAndSettle();
          expect(find.text('PRIVATE HOME'), findsNothing);
          expect(find.text(Usuario.studentAccessMessage), findsOneWidget);
          expect(store.writes, 0);
          final context = tester.element(find.byType(LoginScreen));
          Navigator.of(context).pushNamed('/home');
          await tester.pumpAndSettle();
          expect(find.text('PRIVATE HOME'), findsNothing);
          expect(vm.isAuthenticated, isFalse);
          await tester.pumpWidget(const SizedBox());
        },
        () => MockClient(
          (_) async => http.Response(
            jsonEncode({
              'user': {...student, 'role': 'ADMINISTRADOR'},
              'accessToken': 'fixture',
            }),
            200,
          ),
        ),
      );
      vm.dispose();
    },
  );
}
