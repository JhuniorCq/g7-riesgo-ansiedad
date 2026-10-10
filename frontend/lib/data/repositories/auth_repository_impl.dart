import '../../../domain/entities/usuario.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../datasources/remote/auth_remote_datasource.dart';

/// Implementación del repositorio de autenticación.
///
/// Esta clase implementa la interfaz AuthRepository utilizando
/// el AuthRemoteDataSource para las llamadas HTTP.
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<({String token, Usuario usuario})> login({
    required String correo,
    required String contrasena,
  }) async {
    final result = await _remoteDataSource.login(
      correo: correo,
      contrasena: contrasena,
    );
    return (token: result.token, usuario: result.usuario.toEntity());
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
    return _remoteDataSource.registrar(
      nombres: nombres,
      apellidos: apellidos,
      codigo: codigo,
      correo: correo,
      contrasena: contrasena,
      escuela: escuela,
      ciclo: ciclo,
    );
  }

  @override
  Future<void> logout() async {
    return _remoteDataSource.logout();
  }
}
