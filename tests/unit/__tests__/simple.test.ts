// Simple test to verify Jest setup works
describe('Test Setup Verification', () => {
  test('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  test('should mock localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });
});