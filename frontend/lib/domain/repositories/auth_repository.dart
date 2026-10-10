import '../entities/usuario.dart';

/// Interfaz abstracta del repositorio de autenticación.
///
/// Define el contrato para operaciones de autenticación sin depender
/// de detalles de implementación (API, almacenamiento local, etc.).
abstract class AuthRepository {
  /// Autentica un usuario con correo y contraseña.
  /// Retorna el token JWT y los datos del usuario si es exitoso.
  Future<({String token, Usuario usuario})> login({
    required String correo,
    required String contrasena,
  });

  /// Registra un nuevo usuario en el sistema.
  Future<void> registrar({
    required String nombre,
    required String correo,
    required String contrasena,
    String? facultad,
    int? ciclo,
  });

  /// Cierra la sesión del usuario actual.
  Future<void> logout();
}
