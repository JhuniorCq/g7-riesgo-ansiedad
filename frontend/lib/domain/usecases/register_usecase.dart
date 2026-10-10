import '../repositories/auth_repository.dart';

/// UseCase para registrar un nuevo usuario.
///
/// Encapsula la lógica de registro, permitiendo que la capa de presentación
/// no conozca los detalles de cómo se realiza el registro.
class RegisterUseCase {
  final AuthRepository _authRepository;

  RegisterUseCase(this._authRepository);

  /// Ejecuta el caso de uso de registro.
  Future<void> call({
    required String nombre,
    required String correo,
    required String contrasena,
    String? facultad,
    int? ciclo,
  }) async {
    return _authRepository.registrar(
      nombre: nombre,
      correo: correo,
      contrasena: contrasena,
      facultad: facultad,
      ciclo: ciclo,
    );
  }
}
