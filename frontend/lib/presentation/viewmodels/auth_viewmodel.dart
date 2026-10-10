import 'package:flutter/foundation.dart';
import '../../../domain/entities/usuario.dart';
import '../../../domain/usecases/login_usecase.dart';
import '../../../domain/usecases/register_usecase.dart';
import '../../../domain/usecases/logout_usecase.dart';

/// ViewModel encargado de la autenticación (Login y Registro).
///
/// Ahora recibe UseCases en lugar de ApiService directamente,
/// siguiendo el principio de que la capa de presentación no debe
/// conocer detalles de implementación de la capa de datos.
class AuthViewModel extends ChangeNotifier {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;

  AuthViewModel(this._loginUseCase, this._registerUseCase, this._logoutUseCase);

  // ==========================================
  // ESTADOS
  // ==========================================
  bool _isLoading = false;
  String? _error;
  String? _token;
  bool _isAuthenticated = false;
  Usuario? _usuario;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  Usuario? get usuario => _usuario;
  String? get nombre => _usuario?.nombre;
  String? get correo => _usuario?.correo;
  int? get idUsuario => _usuario?.idUsuario;

  // ==========================================
  // LOGIN
  // ==========================================
  Future<bool> login(String correo, String contrasena) async {
    if (_isLoading) return false;
    _token = null;
    _usuario = null;
    _isAuthenticated = false;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _loginUseCase(
        correo: correo,
        contrasena: contrasena,
      );

      _token = result.token;
      _usuario = result.usuario;
      _isAuthenticated = true;
      return true;
    } catch (e) {
      _token = null;
      _usuario = null;
      _isAuthenticated = false;
      _error = e is Exception
          ? e.toString().replaceFirst(RegExp(r'^Exception: '), '')
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ==========================================
  // REGISTRO
  // ==========================================
  Future<bool> registrar({
    required String nombres,
    required String apellidos,
    required String codigo,
    required String correo,
    required String contrasena,
    required String escuela,
    required int ciclo,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _registerUseCase(
        nombres: nombres,
        apellidos: apellidos,
        codigo: codigo,
        correo: correo,
        contrasena: contrasena,
        escuela: escuela,
        ciclo: ciclo,
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().contains('Exception')
          ? e.toString()
          : 'Error de conexión con el servidor';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  Future<void> logout() async {
    await _logoutUseCase();
    _token = null;
    _isAuthenticated = false;
    _usuario = null;
    notifyListeners();
  }

  // ==========================================
  // LIMPIAR ERROR
  // ==========================================
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
