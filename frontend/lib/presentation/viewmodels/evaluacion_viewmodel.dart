import 'package:flutter/foundation.dart';
import '../../../domain/entities/evaluacion.dart';
import '../../../domain/entities/recomendacion.dart';
import '../../../domain/entities/resultado_ml.dart';
import '../../../domain/usecases/evaluar_riesgo_usecase.dart';
import '../../../domain/usecases/obtener_historial_usecase.dart';

/// ViewModel encargado de las evaluaciones de riesgo de ansiedad.
///
/// Ahora recibe UseCases en lugar de ApiService directamente,
/// siguiendo el principio de que la capa de presentación no debe
/// conocer detalles de implementación de la capa de datos.
class EvaluacionViewModel extends ChangeNotifier {
  final EvaluarRiesgoUseCase _evaluarRiesgoUseCase;
  final ObtenerHistorialUseCase _obtenerHistorialUseCase;

  EvaluacionViewModel(
    this._evaluarRiesgoUseCase,
    this._obtenerHistorialUseCase,
  );

  // ==========================================
  // ESTADOS
  // ==========================================
  bool _isLoading = false;
  String? _error;
  double? _probabilidad;
  String? _nivelRiesgo;
  String? _explicacion;
  List<Recomendacion> _recomendaciones = [];
  List<Evaluacion> _historial = [];
  ResultadoMl? _ultimoResultado;

  bool get isLoading => _isLoading;
  String? get error => _error;
  double? get probabilidad => _probabilidad;
  String? get nivelRiesgo => _nivelRiesgo;
  String? get explicacion => _explicacion;
  List<Recomendacion> get recomendaciones => _recomendaciones;
  List<Evaluacion> get historial => _historial;
  ResultadoMl? get ultimoResultado => _ultimoResultado;

  // ==========================================
  // EVALUAR RIESGO
  // ==========================================
  Future<bool> evaluarRiesgo(Map<String, double> variables) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _evaluarRiesgoUseCase(variables);

      _probabilidad = result.resultado.probabilidadAnsiedad;
      _nivelRiesgo = result.resultado.nivelRiesgo;
      _explicacion = result.explicacion;
      _recomendaciones = result.recomendaciones;
      _ultimoResultado = result.resultado;

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
  // OBTENER HISTORIAL
  // ==========================================
  Future<void> obtenerHistorial() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _historial = await _obtenerHistorialUseCase();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString().contains('Exception')
          ? e.toString()
          : 'Error de conexión con el servidor';
      _isLoading = false;
      notifyListeners();
    }
  }

  // ==========================================
  // LIMPIAR
  // ==========================================
  void limpiarResultado() {
    _probabilidad = null;
    _nivelRiesgo = null;
    _explicacion = null;
    _recomendaciones = [];
    _ultimoResultado = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
