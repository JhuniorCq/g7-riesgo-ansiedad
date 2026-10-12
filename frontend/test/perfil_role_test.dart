import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ansiedad_ml_app/core/app_colors.dart';
import 'package:ansiedad_ml_app/domain/entities/usuario.dart';
import 'package:ansiedad_ml_app/domain/repositories/auth_repository.dart';
import 'package:ansiedad_ml_app/domain/usecases/login_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/logout_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/register_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/restaurar_sesion_usecase.dart';
import 'package:ansiedad_ml_app/presentation/pages/perfil/perfil_screen.dart';
import 'package:ansiedad_ml_app/presentation/viewmodels/auth_viewmodel.dart';
import 'package:ansiedad_ml_app/presentation/viewmodels/theme_viewmodel.dart';

Usuario _usuario({required String? role}) => Usuario(
  idUsuario: 1,
  nombres: 'Ana',
  apellidos: 'Perez',
  codigo: '0012345',
  correo: 'ana@example.com',
  escuela: 'Ingeniería de Sistemas',
  ciclo: 9,
  createdAt: '2026-10-12T00:00:00Z',
  role: role,
);

class _FakeAuthRepository implements AuthRepository {
  final Usuario usuario;
  _FakeAuthRepository(this.usuario);

  @override
  Future<({String token, Usuario usuario})> login({
    required String correo,
    required String contrasena,
  }) async => (token: 'fixture', usuario: usuario);

  @override
  Future<({String token, Usuario usuario})?> restaurarSesion() async => null;

  @override
  Future<void> registrar({
    required String nombres,
    required String apellidos,
    required String codigo,
    required String correo,
    required String contrasena,
    required String escuela,
    required int ciclo,
  }) async {}

  @override
  Future<void> logout() async {}
}

Future<AuthViewModel> _autenticar(Usuario usuario) async {
  final repo = _FakeAuthRepository(usuario);
  final vm = AuthViewModel(
    LoginUseCase(repo),
    RegisterUseCase(repo),
    LogoutUseCase(repo),
    RestaurarSesionUseCase(repo),
  );
  await vm.login('ana@example.com', 'fixture');
  return vm;
}

/// Envuelve la pantalla con el tema que la app usa en producción, ya que
/// `AppColors.of` exige la extensión registrada en `ThemeData`.
Future<void> _montarPerfil(WidgetTester tester, AuthViewModel vm) async {
  await tester.pumpWidget(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: vm),
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
      ],
      child: MaterialApp(
        theme: ThemeData(extensions: [AppColors.light]),
        home: const PerfilScreen(),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('muestra "Estudiante" cuando el rol real es ESTUDIANTE', (
    tester,
  ) async {
    final vm = await _autenticar(_usuario(role: 'ESTUDIANTE'));
    addTearDown(vm.dispose);
    await _montarPerfil(tester, vm);
    expect(find.text('Estudiante'), findsOneWidget);
    expect(find.text('Sin rol asignado'), findsNothing);
  });

  testWidgets('muestra "Sin rol asignado" cuando el rol no está disponible', (
    tester,
  ) async {
    final vm = await _autenticar(_usuario(role: null));
    addTearDown(vm.dispose);
    await _montarPerfil(tester, vm);
    expect(find.text('Sin rol asignado'), findsOneWidget);
    expect(find.text('Estudiante'), findsNothing);
  });
}
