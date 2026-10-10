import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Core
import 'core/app_colors.dart';
import 'core/constants.dart';

// Data
import 'data/datasources/remote/api_service.dart';
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/evaluacion_repository_impl.dart';
import 'data/repositories/medico_repository_impl.dart';
import 'data/datasources/remote/auth_remote_datasource.dart';
import 'data/datasources/remote/evaluacion_remote_datasource.dart';
import 'data/datasources/remote/medico_remote_datasource.dart';

// Domain UseCases
import 'domain/usecases/login_usecase.dart';
import 'domain/usecases/register_usecase.dart';
import 'domain/usecases/logout_usecase.dart';
import 'domain/usecases/evaluar_riesgo_usecase.dart';
import 'domain/usecases/obtener_historial_usecase.dart';
import 'domain/usecases/obtener_estadisticas_medico_usecase.dart';
import 'domain/usecases/obtener_pacientes_usecase.dart';
import 'domain/usecases/obtener_evaluaciones_recientes_usecase.dart';

// Presentation
import 'presentation/viewmodels/auth_viewmodel.dart';
import 'presentation/viewmodels/evaluacion_viewmodel.dart';
import 'presentation/viewmodels/medico_viewmodel.dart';
import 'presentation/viewmodels/theme_viewmodel.dart';
import 'presentation/pages/onboarding/onboarding_screen.dart';
import 'presentation/pages/auth/login_screen.dart';
import 'presentation/pages/home/home_screen.dart';
import 'presentation/pages/admin/admin_home_screen.dart';
import 'presentation/pages/medico/medico_home_screen.dart';
import 'presentation/pages/evaluacion/evaluacion_screen.dart';
import 'presentation/pages/evaluacion/resultado_screen.dart';
import 'presentation/pages/evaluacion/historial_screen.dart';
import 'presentation/pages/perfil/perfil_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Inicializar configuración de API (cargar URL guardada)
  await AppConstants.init();
  runApp(const AnsiedadApp());
}

class AnsiedadApp extends StatelessWidget {
  const AnsiedadApp({super.key});

  @override
  Widget build(BuildContext context) {
    // ==========================================
    // INYECCIÓN DE DEPENDENCIAS (Clean Architecture)
    // ==========================================

    // Data Layer
    final apiService = ApiService();
    final authRemoteDataSource = AuthRemoteDataSource(apiService);
    final evaluacionRemoteDataSource = EvaluacionRemoteDataSource(apiService);
    final medicoRemoteDataSource = MedicoRemoteDataSource(apiService);

    // Repository Layer
    final authRepository = AuthRepositoryImpl(authRemoteDataSource);
    final evaluacionRepository = EvaluacionRepositoryImpl(
      evaluacionRemoteDataSource,
    );
    final medicoRepository = MedicoRepositoryImpl(medicoRemoteDataSource);

    // UseCase Layer
    final loginUseCase = LoginUseCase(authRepository);
    final registerUseCase = RegisterUseCase(authRepository);
    final logoutUseCase = LogoutUseCase(authRepository);
    final evaluarRiesgoUseCase = EvaluarRiesgoUseCase(evaluacionRepository);
    final obtenerHistorialUseCase = ObtenerHistorialUseCase(
      evaluacionRepository,
    );
    final obtenerEstadisticasMedicoUseCase = ObtenerEstadisticasMedicoUseCase(
      medicoRepository,
    );
    final obtenerPacientesUseCase = ObtenerPacientesUseCase(medicoRepository);
    final obtenerEvaluacionesRecientesUseCase =
        ObtenerEvaluacionesRecientesUseCase(medicoRepository);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
        ChangeNotifierProvider(
          create: (_) =>
              AuthViewModel(loginUseCase, registerUseCase, logoutUseCase),
        ),
        ChangeNotifierProvider(
          create: (_) => EvaluacionViewModel(
            evaluarRiesgoUseCase,
            obtenerHistorialUseCase,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => MedicoViewModel(
            obtenerEstadisticasMedicoUseCase,
            obtenerPacientesUseCase,
            obtenerEvaluacionesRecientesUseCase,
          ),
        ),
      ],
      child: Consumer<ThemeNotifier>(
        builder: (context, themeNotifier, _) {
          return MaterialApp(
            title: 'Evaluación de Riesgo',
            debugShowCheckedModeBanner: false,
            themeMode: themeNotifier.themeMode,
            theme: ThemeData(
              brightness: Brightness.light,
              colorScheme: const ColorScheme.light(
                primary: Color(0xFF6366F1),
                secondary: Color(0xFF6366F1),
                surface: Colors.white,
              ),
              useMaterial3: true,
              appBarTheme: const AppBarTheme(
                centerTitle: true,
                elevation: 1,
                backgroundColor: Colors.white,
                foregroundColor: Color(0xFF1E293B),
              ),
              scaffoldBackgroundColor: const Color(0xFFF8FAFC),
              extensions: [AppColors.light],
            ),
            darkTheme: ThemeData(
              brightness: Brightness.dark,
              colorScheme: const ColorScheme.dark(
                primary: Color(0xFF818CF8),
                secondary: Color(0xFF818CF8),
                surface: Color(0xFF1E293B),
              ),
              useMaterial3: true,
              appBarTheme: const AppBarTheme(
                centerTitle: true,
                elevation: 0,
                backgroundColor: Color(0xFF0F172A),
                foregroundColor: Color(0xFFF1F5F9),
              ),
              scaffoldBackgroundColor: const Color(0xFF0F172A),
              extensions: [AppColors.dark],
            ),
            initialRoute: '/onboarding',
            routes: {
              '/onboarding': (context) => const OnboardingScreen(),
              '/login': (context) => const LoginScreen(),
              '/home': (context) => const HomeScreen(),
              '/admin-home': (context) => const AdminHomeScreen(),
              '/medico-home': (context) => const MedicoHomeScreen(),
              '/evaluacion': (context) => const EvaluacionScreen(),
              '/resultado': (context) => const ResultadoScreen(),
              '/historial': (context) => const HistorialScreen(),
              '/perfil': (context) => const PerfilScreen(),
            },
          );
        },
      ),
    );
  }
}
