// AsyncStorage 공식 목(mock) — 테스트에서 실제 저장소 대신 메모리를 쓴다
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
