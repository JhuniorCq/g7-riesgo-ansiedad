import 'package:flutter/foundation.dart';
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
  Map<String, dynamic>? _usuario;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get usuario => _usuario;
  String? get rol => _usuario?['rol'] as String?;
  String? get nombre => _usuario?['nombre'] as String?;
  String? get correo => _usuario?['correo'] as String?;
  int? get idUsuario => _usuario?['id_usuario'] as int?;

  // ==========================================
  // LOGIN
  // ==========================================
  Future<bool> login(String correo, String contrasena) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _loginUseCase(
        correo: correo,
        contrasena: contrasena,
      );

      _token = result.token;
      _usuario = {
        'id_usuario': result.idUsuario,
        'nombre': result.nombre,
        'correo': correo,
        'rol': result.rol,
      };
      if (_token != null) {
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = 'No se recibió token de autenticación';
      _isLoading = false;
      notifyListeners();
      return false;
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
  // REGISTRO
  // ==========================================
  Future<bool> registrar({
    required String nombre,
    required String correo,
    required String contrasena,
    String? facultad,
    int? ciclo,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _registerUseCase(
        nombre: nombre,
        correo: correo,
        contrasena: contrasena,
        facultad: facultad,
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
