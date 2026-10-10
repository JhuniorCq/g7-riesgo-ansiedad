import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:ansiedad_ml_app/data/datasources/local/escuela_local_datasource.dart';
import 'package:ansiedad_ml_app/data/repositories/escuela_repository_impl.dart';
import 'package:ansiedad_ml_app/domain/entities/escuela.dart';
import 'package:ansiedad_ml_app/domain/entities/usuario.dart';
import 'package:ansiedad_ml_app/domain/repositories/auth_repository.dart';
import 'package:ansiedad_ml_app/domain/usecases/login_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/logout_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/obtener_escuelas_usecase.dart';
import 'package:ansiedad_ml_app/domain/usecases/register_usecase.dart';
import 'package:ansiedad_ml_app/presentation/pages/auth/registro_screen.dart';
import 'package:ansiedad_ml_app/presentation/viewmodels/auth_viewmodel.dart';
import 'package:ansiedad_ml_app/presentation/viewmodels/escuela_viewmodel.dart';

/// Repositorio de autenticación falso para la prueba de widget:
/// evita cualquier llamada HTTP y marca si se intentó registrar.
class _AuthRepositoryPrueba implements AuthRepository {
  bool registroLlamado = false;

  @override
  Future<({String token, Usuario usuario})> login({
    required String correo,
    required String contrasena,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<void> registrar({
    required String nombres,
    required String apellidos,
    required String codigo,
    required String correo,
    required String contrasena,
    required String escuela,
    required int ciclo,
  }) async {
    registroLlamado = true;
  }

  @override
  Future<void> logout() async {
    throw UnimplementedError();
  }
}

/// Monta la pantalla de registro con el catálogo real (asset local) y un
/// repositorio de autenticación falso, y espera a que la UI quede estable.
Future<_AuthRepositoryPrueba> _pumpRegistro(WidgetTester tester) async {
  final authRepository = _AuthRepositoryPrueba();

  final escuelaViewModel = EscuelaViewModel(
    ObtenerEscuelasUseCase(EscuelaRepositoryImpl(EscuelaLocalDataSource())),
  );
  // La carga del asset se realiza en contexto asíncrono real con runAsync:
  // dentro de testWidgets, flutter test solo entrega la primera lectura de
  // rootBundle por proceso de prueba. Con el catálogo precargado, la
  // inicialización segura (post-frame) de la pantalla detecta los datos y
  // no vuelve a cargar.
  await tester.runAsync(() => escuelaViewModel.cargarEscuelas());

  await tester.pumpWidget(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<EscuelaViewModel>.value(
          value: escuelaViewModel,
        ),
        ChangeNotifierProvider(
          create: (_) => AuthViewModel(
            LoginUseCase(authRepository),
            RegisterUseCase(authRepository),
            LogoutUseCase(authRepository),
          ),
        ),
      ],
      child: const MaterialApp(home: Scaffold(body: RegistroScreen())),
    ),
  );
  await tester.pumpAndSettle();
  return authRepository;
}

/// Ejecuta la validación del formulario completo vía su [FormState].
Future<void> _validarFormulario(WidgetTester tester) async {
  final form = tester.state<FormState>(find.byType(Form));
  form.validate();
  await tester.pump();
}

void main() {
  testWidgets(
    'muestra las 74 escuelas del catálogo y permite seleccionar una',
    (tester) async {
      final authRepository = await _pumpRegistro(tester);
      expect(authRepository.registroLlamado, isFalse);

      final escuelaVM = Provider.of<EscuelaViewModel>(
        tester.element(find.byType(RegistroScreen)),
        listen: false,
      );
      expect(escuelaVM.error, isNull);
      expect(escuelaVM.escuelas.length, 74);

      final dropdown = find.byType(DropdownButtonFormField<Escuela>);
      expect(dropdown, findsOneWidget);

      await tester.ensureVisible(dropdown);
      await tester.tap(dropdown);
      await tester.pumpAndSettle();

      // La primera escuela del orden alfabético está en el menú abierto.
      expect(find.text('Administración'), findsWidgets);

      await tester.tap(find.text('Administración').last);
      await tester.pumpAndSettle();

      // Con el menú cerrado, la selección se conserva en el campo.
      expect(find.text('Administración'), findsOneWidget);
    },
  );

  group('Formulario de registro (campos Users)', () {
    testWidgets(
      'presenta los campos Nombres, Apellidos y Código de estudiante',
      (tester) async {
        await _pumpRegistro(tester);

        expect(find.byType(TextFormField), findsNWidgets(6));
        expect(find.text('Nombres'), findsOneWidget);
        expect(find.text('Apellidos'), findsOneWidget);
        expect(find.text('Código de estudiante'), findsOneWidget);
      },
    );

    testWidgets('valida los campos obligatorios con mensajes en español', (
      tester,
    ) async {
      await _pumpRegistro(tester);

      await _validarFormulario(tester);

      expect(find.text('Por favor, ingresa tus nombres'), findsOneWidget);
      expect(find.text('Por favor, ingresa tus apellidos'), findsOneWidget);
      expect(
        find.text('Por favor, ingresa tu código de estudiante'),
        findsOneWidget,
      );
      expect(find.text('Por favor, ingresa tu correo'), findsOneWidget);
      expect(find.text('Selecciona tu escuela profesional'), findsOneWidget);
    });

    testWidgets(
      'conserva el código de estudiante como texto con ceros iniciales',
      (tester) async {
        await _pumpRegistro(tester);

        final campos = find.byType(TextFormField);
        await tester.ensureVisible(campos.at(2));
        await tester.enterText(campos.at(2), '0012345');
        await tester.pump();

        final editableCodigo = tester.widget<EditableText>(
          find.descendant(
            of: campos.at(2),
            matching: find.byType(EditableText),
          ),
        );
        expect(editableCodigo.controller.text, '0012345');
      },
    );

    testWidgets('las contraseñas deben coincidir', (tester) async {
      await _pumpRegistro(tester);

      final campos = find.byType(TextFormField);
      await tester.ensureVisible(campos.at(4));
      await tester.enterText(campos.at(4), 'clave123456');
      await tester.enterText(campos.at(5), 'claveDISTINTA');
      await tester.pump();

      await _validarFormulario(tester);

      expect(find.text('Las contraseñas no coinciden'), findsOneWidget);
    });

    testWidgets(
      'el botón de registro está deshabilitado y no invoca el registro antiguo',
      (tester) async {
        final authRepository = await _pumpRegistro(tester);

        final botonFinder = find.widgetWithText(ElevatedButton, 'Crear Cuenta');
        final boton = tester.widget<ElevatedButton>(botonFinder);
        expect(boton.onPressed, isNull);

        await tester.ensureVisible(botonFinder);
        await tester.tap(botonFinder);
        await tester.pumpAndSettle();

        expect(authRepository.registroLlamado, isFalse);
        expect(find.textContaining('microservicio Users'), findsOneWidget);
      },
    );
  });

  testWidgets('la escuela profesional es un campo obligatorio', (
    tester,
  ) async {
    final authRepository = await _pumpRegistro(tester);

    final campos = find.byType(TextFormField);
    expect(campos, findsNWidgets(6));

    await tester.ensureVisible(campos.at(0));
    await tester.enterText(campos.at(0), 'Ana');
    await tester.enterText(campos.at(1), 'Torres Vargas');
    await tester.enterText(campos.at(2), '0012345');
    await tester.enterText(campos.at(3), 'ana@correo.com');
    await tester.enterText(campos.at(4), 'clave123456');
    await tester.enterText(campos.at(5), 'clave123456');
    await tester.pump();

    await _validarFormulario(tester);

    expect(find.text('Selecciona tu escuela profesional'), findsOneWidget);
    expect(authRepository.registroLlamado, isFalse);
  });
}
