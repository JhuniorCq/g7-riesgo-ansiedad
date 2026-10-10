import 'package:flutter_test/flutter_test.dart';
import 'package:ansiedad_ml_app/main.dart';

void main() {
  testWidgets('El arranque permite acceder al login desde onboarding', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const AnsiedadApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Saltar'));
    await tester.pumpAndSettle();
    expect(find.text('Iniciar Sesión'), findsWidgets);
  });
}
