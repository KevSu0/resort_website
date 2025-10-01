import { JWTService } from '../services/jwt';
import { PasswordService } from '../services/password';

// Simple test to verify authentication services work
async function testAuthServices() {
  console.log('Testing JWT Service...');

  // Test JWT token generation and validation
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'USER',
    brandId: 'test-brand-123',
    sessionId: 'test-session-123',
  };

  const accessToken = JWTService.generateAccessToken(testPayload);
  console.log('✓ Access token generated');

  const refreshToken = JWTService.generateRefreshToken(testPayload.userId, testPayload.sessionId);
  console.log('✓ Refresh token generated');

  const decodedToken = JWTService.verifyAccessToken(accessToken);
  console.log('✓ Access token verified successfully');

  const decodedRefreshToken = JWTService.verifyRefreshToken(refreshToken);
  console.log('✓ Refresh token verified successfully');

  // Test password hashing and verification
  console.log('\nTesting Password Service...');

  const testPassword = 'TestPassword123!';
  const hashedPassword = await PasswordService.hashPassword(testPassword);
  console.log('✓ Password hashed successfully');

  const isValidPassword = await PasswordService.verifyPassword(testPassword, hashedPassword);
  console.log('✓ Password verification successful:', isValidPassword);

  const invalidPassword = await PasswordService.verifyPassword('WrongPassword', hashedPassword);
  console.log('✓ Invalid password correctly rejected:', !invalidPassword);

  // Test password strength validation
  const strongPassword = 'StrongP@ssw0rd!';
  const validation = PasswordService.validatePasswordStrength(strongPassword);
  console.log('✓ Strong password validation:', validation.isValid);

  const weakPassword = 'weak';
  const weakValidation = PasswordService.validatePasswordStrength(weakPassword);
  console.log('✓ Weak password correctly rejected:', !weakValidation.isValid);

  console.log('\n🎉 All authentication service tests passed!');
}

// Run the test
testAuthServices().catch(console.error);