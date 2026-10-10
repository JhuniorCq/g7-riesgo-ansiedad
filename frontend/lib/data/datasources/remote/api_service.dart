import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

/// Servicio genérico para realizar llamadas HTTP al backend.
///
/// Esta clase reside en la capa de datos porque es un detalle
/// de implementación de la comunicación con la API.
class ApiService {
  String? _token;

  /// Establece el token JWT para autenticación
  void setToken(String? token) {
    _token = token;
  }

  /// Construye los headers con autenticación si hay token
  Map<String, String> _headers({bool withAuth = true}) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (withAuth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  /// Realiza una petición GET
  Future<Map<String, dynamic>> get(String url) async {
    final response = await http
        .get(Uri.parse(url), headers: _headers())
        .timeout(const Duration(seconds: 15));
    return _procesarRespuesta(response);
  }

  /// Realiza una petición GET que devuelve una lista
  Future<List<dynamic>> getList(String url) async {
    final response = await http
        .get(Uri.parse(url), headers: _headers())
        .timeout(const Duration(seconds: 15));
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw ApiException(
      statusCode: response.statusCode,
      mensaje: _extraerMensaje(response.body),
    );
  }

  /// Realiza una petición POST
  Future<Map<String, dynamic>> post(
    String url, {
    Map<String, dynamic>? body,
    bool withAuth = true,
  }) async {
    final response = await http
        .post(
          Uri.parse(url),
          headers: _headers(withAuth: withAuth),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(const Duration(seconds: 15));
    return _procesarRespuesta(response);
  }

  /// Realiza una petición PUT
  Future<Map<String, dynamic>> put(
    String url, {
    Map<String, dynamic>? body,
  }) async {
    final response = await http
        .put(
          Uri.parse(url),
          headers: _headers(),
          body: body != null ? jsonEncode(body) : null,
        )
        .timeout(const Duration(seconds: 15));
    return _procesarRespuesta(response);
  }

  /// Realiza una petición DELETE
  Future<Map<String, dynamic>> delete(String url) async {
    final response = await http
        .delete(Uri.parse(url), headers: _headers())
        .timeout(const Duration(seconds: 15));
    return _procesarRespuesta(response);
  }

  /// Procesa la respuesta HTTP y lanza excepción si hay error
  Map<String, dynamic> _procesarRespuesta(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) return decoded;
      return {'data': decoded};
    }
    throw ApiException(
      statusCode: response.statusCode,
      mensaje: _extraerMensaje(response.body),
    );
  }

  /// Extrae el mensaje de error del cuerpo de la respuesta
  String _extraerMensaje(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        return decoded['mensaje'] ??
            decoded['message'] ??
            decoded['error'] ??
            'Error desconocido';
      }
    } catch (_) {}
    return 'Error en la comunicación con el servidor';
  }
}

/// Excepción personalizada para errores de API
class ApiException implements Exception {
  final int statusCode;
  final String mensaje;

  ApiException({required this.statusCode, required this.mensaje});

  @override
  String toString() => 'ApiException($statusCode): $mensaje';
}
