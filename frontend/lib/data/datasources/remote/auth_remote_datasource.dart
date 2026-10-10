import '../../../../core/constants.dart';
import '../../models/usuario_model.dart';
import 'api_service.dart';

/// DataSource remoto para operaciones de autenticación.
///
/// Esta clase encapsula todas las llamadas HTTP relacionadas con
/// autenticación, convirtiendo JSON a DTOs y viceversa.
class AuthRemoteDataSource {
  final ApiService _apiService;

  AuthRemoteDataSource(this._apiService);

  /// Inicia sesión y retorna el token y el usuario.
  Future<({String token, UsuarioModel usuario})> login({
    required String correo,
    required String contrasena,
  }) async {
    final response = await _apiService.post(
      AppConstants.login,
      body: {'correo': correo, 'contrasena': contrasena},
      withAuth: false,
    );

    final token = response['token'] as String?;
    final usuarioJson = response['usuario'] as Map<String, dynamic>?;

    if (token == null || usuarioJson == null) {
      throw Exception('Respuesta inválida del servidor');
    }

    // Propagar el token al ApiService para peticiones autenticadas futuras
    _apiService.setToken(token);

    final usuario = UsuarioModel.fromJson(usuarioJson);
    return (token: token, usuario: usuario);
  }

  /// Registra un nuevo usuario.
  Future<void> registrar({
    required String nombre,
    required String correo,
    required String contrasena,
    String? facultad,
    int? ciclo,
  }) async {
    final body = <String, dynamic>{
      'nombre': nombre,
      'correo': correo,
      'contrasena': contrasena,
    };
    if (facultad != null && facultad.isNotEmpty) body['facultad'] = facultad;
    if (ciclo != null) body['ciclo'] = ciclo;

    await _apiService.post(AppConstants.registro, body: body, withAuth: false);
  }

  /// Cierra la sesión (limpia el token del ApiService).
  Future<void> logout() async {
    // No hay endpoint de logout en el backend, solo limpiamos el token
    _apiService.setToken(null);
  }
}
