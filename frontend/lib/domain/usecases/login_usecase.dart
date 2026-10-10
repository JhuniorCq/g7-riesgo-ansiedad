import '../repositories/auth_repository.dart';

/// UseCase para autenticar un usuario.
///
/// Encapsula la lógica de login, permitiendo que la capa de presentación
/// no conozca los detalles de cómo se realiza la autenticación.
class LoginUseCase {
  final AuthRepository _authRepository;

  LoginUseCase(this._authRepository);

  /// Ejecuta el caso de uso de login.
  ///
  /// Retorna una tupla con el token y el usuario si es exitoso.
  Future<({String token, String nombre, String rol, int idUsuario})> call({
    required String correo,
    required String contrasena,
  }) async {
    final result = await _authRepository.login(
      correo: correo,
      contrasena: contrasena,
    );
    return (
      token: result.token,
      nombre: result.usuario.nombre,
      rol: result.usuario.rol,
      idUsuario: result.usuario.idUsuario,
    );
  }
}
