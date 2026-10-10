import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb, kReleaseMode;
import 'package:shared_preferences/shared_preferences.dart';

/// Configuración global de la aplicación.
///
/// Centraliza constantes, URLs de API y endpoints.
/// Reemplaza la antigua clase `ApiConfig` siguiendo el principio
/// de que la capa core no debe depender de detalles de implementación.
class AppConstants {
  // ==========================================
  // CONSTANTES
  // ==========================================
  static const String _defaultPort = '5000';
  static const String _prefsKey = 'api_base_url';

  // ==========================================
  // URL BASE DETECTADA AUTOMÁTICAMENTE
  // ==========================================
  static String _baseUrl = _detectarBaseUrl();
  static bool _inicializado = false;

  /// Inicializa la configuración cargando la URL guardada (si existe)
  static Future<void> init() async {
    if (_inicializado) return;
    final prefs = await SharedPreferences.getInstance();
    final guardada = prefs.getString(_prefsKey);
    if (guardada != null && guardada.isNotEmpty) {
      _baseUrl = guardada;
    }
    _inicializado = true;
  }

  /// Obtiene la URL base actual
  static String get baseUrl => _baseUrl;

  /// Cambia la URL base y la persiste
  static Future<void> setBaseUrl(String nuevaUrl) async {
    // Limpiar la URL: quitar barra al final si la tiene
    _baseUrl = nuevaUrl.replaceAll(RegExp(r'/+$'), '');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, _baseUrl);
  }

  /// Restablece la URL base a la detectada automáticamente
  static Future<void> resetBaseUrl() async {
    _baseUrl = _detectarBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }

  /// URL base para producción (Render)
  static const String _produccionUrl =
      'https://ansiedad-riesgo-ml-app.onrender.com';

  /// Detecta la URL base según la plataforma
  static String _detectarBaseUrl() {
    // En producción (release mode), usar URL de Render
    if (kReleaseMode) {
      return _produccionUrl;
    }

    // En desarrollo web, usar localhost
    if (kIsWeb) {
      return 'http://localhost:$_defaultPort';
    }

    try {
      if (Platform.isAndroid) {
        // En emulador Android, 10.0.2.2 apunta al host local de la máquina
        // En dispositivo físico, se necesita la IP real del servidor
        return 'http://10.0.2.2:$_defaultPort';
      } else if (Platform.isIOS) {
        // En iOS Simulator, localhost funciona directamente
        // En dispositivo físico, se necesita la IP real del servidor
        return 'http://localhost:$_defaultPort';
      } else if (Platform.isMacOS) {
        return 'http://localhost:$_defaultPort';
      } else if (Platform.isWindows) {
        return 'http://localhost:$_defaultPort';
      } else if (Platform.isLinux) {
        return 'http://localhost:$_defaultPort';
      }
    } catch (_) {
      // Si hay algún error al detectar la plataforma, usar localhost
    }

    return 'http://localhost:$_defaultPort';
  }

  // ==========================================
  // ENDPOINTS DE AUTENTICACIÓN
  // ==========================================
  static String get registro => '$_baseUrl/registro';
  static String get login => '$_baseUrl/login';

  // ==========================================
  // ENDPOINTS DE EVALUACIONES
  // ==========================================
  static String get evaluar => '$_baseUrl/api/v1/evaluaciones/';
  static String get historialEvaluaciones =>
      '$_baseUrl/api/v1/evaluaciones/historial';

  // ==========================================
  // ENDPOINTS DE HÁBITOS
  // ==========================================
  static String get habitos => '$_baseUrl/habitos';
  static String get ultimoHabito => '$_baseUrl/habitos/ultimo';

  // ==========================================
  // ENDPOINTS DE ADMIN
  // ==========================================
  static String get adminUsuarios => '$_baseUrl/api/v1/admin/usuarios';
  static String get adminEstadisticas =>
      '$_baseUrl/api/v1/admin/usuarios/estadisticas';

  static String adminUsuarioById(int id) =>
      '$_baseUrl/api/v1/admin/usuarios/$id';
  static String adminCambiarRol(int id) =>
      '$_baseUrl/api/v1/admin/usuarios/$id/rol';
  static String adminEvaluacionById(int id) =>
      '$_baseUrl/api/v1/admin/evaluaciones/$id';

  // ==========================================
  // ENDPOINTS DE MÉDICO
  // ==========================================
  static String get medicoPacientes => '$_baseUrl/api/v1/medico/pacientes';
  static String get medicoEstadisticas =>
      '$_baseUrl/api/v1/medico/estadisticas';
  static String get medicoEvaluacionesRecientes =>
      '$_baseUrl/api/v1/medico/evaluaciones-recientes';
  static String medicoPacienteDetalle(int id) =>
      '$_baseUrl/api/v1/medico/pacientes/$id/detalle';
}
