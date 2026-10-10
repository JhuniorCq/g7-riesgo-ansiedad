import 'package:flutter/foundation.dart';
import '../../../domain/usecases/obtener_estadisticas_medico_usecase.dart';
import '../../../domain/usecases/obtener_pacientes_usecase.dart';
import '../../../domain/usecases/obtener_evaluaciones_recientes_usecase.dart';

/// ViewModel para el panel del Médico.
///
/// Ahora recibe UseCases en lugar de ApiService directamente,
/// siguiendo el principio de que la capa de presentación no debe
/// conocer detalles de implementación de la capa de datos.
class MedicoViewModel extends ChangeNotifier {
  final ObtenerEstadisticasMedicoUseCase _obtenerEstadisticasUseCase;
  final ObtenerPacientesUseCase _obtenerPacientesUseCase;
  final ObtenerEvaluacionesRecientesUseCase
  _obtenerEvaluacionesRecientesUseCase;

  MedicoViewModel(
    this._obtenerEstadisticasUseCase,
    this._obtenerPacientesUseCase,
    this._obtenerEvaluacionesRecientesUseCase,
  );

  // ==========================================
  // ESTADOS
  // ==========================================
  bool _isLoadingStats = false;
  bool _isLoadingPacientes = false;
  bool _isLoadingRecientes = false;
  String? _error;

  Map<String, dynamic>? _estadisticas;
  List<dynamic> _pacientes = [];
  List<dynamic> _evaluacionesRecientes = [];

  bool get isLoadingStats => _isLoadingStats;
  bool get isLoadingPacientes => _isLoadingPacientes;
  bool get isLoadingRecientes => _isLoadingRecientes;
  String? get error => _error;
  Map<String, dynamic>? get estadisticas => _estadisticas;
  List<dynamic> get pacientes => _pacientes;
  List<dynamic> get evaluacionesRecientes => _evaluacionesRecientes;

  // ==========================================
  // CARGAR ESTADÍSTICAS
  // ==========================================
  Future<void> cargarEstadisticas() async {
    _isLoadingStats = true;
    _error = null;
    notifyListeners();

    try {
      _estadisticas = await _obtenerEstadisticasUseCase();
      _isLoadingStats = false;
      notifyListeners();
    } catch (e) {
      _error = 'Error al cargar estadísticas';
      _isLoadingStats = false;
      notifyListeners();
    }
  }

  // ==========================================
  // CARGAR PACIENTES
  // ==========================================
  Future<void> cargarPacientes() async {
    _isLoadingPacientes = true;
    _error = null;
    notifyListeners();

    try {
      _pacientes = await _obtenerPacientesUseCase();
      _isLoadingPacientes = false;
      notifyListeners();
    } catch (e) {
      _error = 'Error al cargar pacientes';
      _isLoadingPacientes = false;
      notifyListeners();
    }
  }

  // ==========================================
  // CARGAR EVALUACIONES RECIENTES
  // ==========================================
  Future<void> cargarEvaluacionesRecientes() async {
    _isLoadingRecientes = true;
    _error = null;
    notifyListeners();

    try {
      _evaluacionesRecientes = await _obtenerEvaluacionesRecientesUseCase();
      _isLoadingRecientes = false;
      notifyListeners();
    } catch (e) {
      _error = 'Error al cargar evaluaciones recientes';
      _isLoadingRecientes = false;
      notifyListeners();
    }
  }

  // ==========================================
  // CARGAR TODO
  // ==========================================
  Future<void> cargarTodo() async {
    await Future.wait([
      cargarEstadisticas(),
      cargarPacientes(),
      cargarEvaluacionesRecientes(),
    ]);
  }

  // ==========================================
  // LIMPIAR ERROR
  // ==========================================
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
