import '../../../../core/constants.dart';
import '../../models/evaluacion_model.dart';
import '../../models/recomendacion_model.dart';
import '../../models/resultado_ml_model.dart';
import 'api_service.dart';

/// DataSource remoto para operaciones de evaluaciones.
///
/// Esta clase encapsula todas las llamadas HTTP relacionadas con
/// evaluaciones, convirtiendo JSON a DTOs y viceversa.
class EvaluacionRemoteDataSource {
  final ApiService _apiService;

  EvaluacionRemoteDataSource(this._apiService);

  /// Envía las respuestas del cuestionario y obtiene la predicción de riesgo.
  Future<
    ({
      ResultadoMlModel resultado,
      List<RecomendacionModel> recomendaciones,
      String? explicacion,
    })
  >
  evaluarRiesgo(Map<String, double> variables) async {
    final response = await _apiService.post(
      AppConstants.evaluar,
      body: variables,
    );

    final probabilidad =
        (response['probabilidad_ansiedad'] as num?)?.toDouble() ?? 0.0;
    final nivelRiesgo = response['nivel_riesgo'] as String? ?? 'BAJO';
    final explicacion = response['explicacion'] as String?;

    final recomendacionesJson =
        response['recomendaciones'] as List<dynamic>? ?? [];
    final recomendaciones = recomendacionesJson
        .map((r) => RecomendacionModel.fromJson(r as Map<String, dynamic>))
        .toList();

    final resultado = ResultadoMlModel(
      idResultado: response['id_evaluacion'] ?? 0,
      idEvaluacion: response['id_evaluacion'] ?? 0,
      idUsuario: 0,
      probabilidadAnsiedad: probabilidad,
      nivelRiesgo: nivelRiesgo,
      recomendaciones: recomendaciones,
    );

    return (
      resultado: resultado,
      recomendaciones: recomendaciones,
      explicacion: explicacion,
    );
  }

  /// Obtiene el historial de evaluaciones del usuario autenticado.
  Future<List<EvaluacionModel>> obtenerHistorial() async {
    final data = await _apiService.getList(AppConstants.historialEvaluaciones);
    return data
        .map((json) => EvaluacionModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
