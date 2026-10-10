  import 'package:flutter_test/flutter_test.dart';
import 'package:ansiedad_ml_app/main.dart';

void main() {
  testWidgets('App should launch', (WidgetTester tester) async {
    await tester.pumpWidget(const AnsiedadApp());
    expect(find.text('Iniciar Sesión'), findsWidgets);
  });
}