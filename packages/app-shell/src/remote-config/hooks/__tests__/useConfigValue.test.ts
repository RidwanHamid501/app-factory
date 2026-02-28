import { renderHook, act } from '@testing-library/react-native';
import {
  useConfigValue,
  useConfigBoolean,
  useConfigString,
  useConfigNumber,
} from '../useConfigValue';
import { useRemoteConfigStore } from '../../remoteConfigStore';

describe('useConfigValue hooks', () => {
  beforeEach(() => {
    useRemoteConfigStore.getState().reset();
  });

  describe('useConfigBoolean', () => {
    it('✅ returns correct boolean value', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: { is_enabled: 'true', is_disabled: 'false' },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      const { result: result1 } = renderHook(() => useConfigBoolean('is_enabled'));
      const { result: result2 } = renderHook(() => useConfigBoolean('is_disabled'));

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
    });

    it('✅ returns default when key not found', () => {
      const { result } = renderHook(() => useConfigBoolean('non_existent', true));

      expect(result.current).toBe(true);
    });

    it('✅ converts types correctly', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: {
            string_true: 'true',
            string_false: 'false',
            string_other: 'yes',
            number_zero: '0',
            number_one: '1',
          },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      expect(renderHook(() => useConfigBoolean('string_true')).result.current).toBe(true);
      expect(renderHook(() => useConfigBoolean('string_false')).result.current).toBe(false);
      expect(renderHook(() => useConfigBoolean('string_other')).result.current).toBe(false);
      expect(renderHook(() => useConfigBoolean('number_zero')).result.current).toBe(false);
      expect(renderHook(() => useConfigBoolean('number_one')).result.current).toBe(false);
    });
  });

  describe('useConfigString', () => {
    it('✅ returns correct string value', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: { api_url: 'https://api.example.com', app_name: 'Test App' },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      const { result: result1 } = renderHook(() => useConfigString('api_url'));
      const { result: result2 } = renderHook(() => useConfigString('app_name'));

      expect(result1.current).toBe('https://api.example.com');
      expect(result2.current).toBe('Test App');
    });

    it('✅ returns default when key not found', () => {
      const { result } = renderHook(() => useConfigString('non_existent', 'default'));

      expect(result.current).toBe('default');
    });

    it('✅ converts types correctly', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: {
            number_value: '123',
            boolean_value: 'true',
          },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      expect(renderHook(() => useConfigString('number_value')).result.current).toBe('123');
      expect(renderHook(() => useConfigString('boolean_value')).result.current).toBe('true');
    });
  });

  describe('useConfigNumber', () => {
    it('✅ returns correct number value', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: { timeout: '5000', max_retries: '3' },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      const { result: result1 } = renderHook(() => useConfigNumber('timeout'));
      const { result: result2 } = renderHook(() => useConfigNumber('max_retries'));

      expect(result1.current).toBe(5000);
      expect(result2.current).toBe(3);
    });

    it('✅ returns default when key not found', () => {
      const { result } = renderHook(() => useConfigNumber('non_existent', 100));

      expect(result.current).toBe(100);
    });

    it('✅ converts types correctly', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: {
            valid_number: '42',
            invalid_number: 'not a number',
            decimal: '3.14',
          },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      expect(renderHook(() => useConfigNumber('valid_number')).result.current).toBe(42);
      expect(renderHook(() => useConfigNumber('invalid_number', 0)).result.current).toBe(0);
      expect(renderHook(() => useConfigNumber('decimal')).result.current).toBe(3.14);
    });
  });

  describe('useConfigValue', () => {
    it('✅ returns raw config value', () => {
      act(() => {
        useRemoteConfigStore.getState().setConfig({
          values: { raw_key: 'raw_value' },
          source: 'remote',
          lastFetchTime: Date.now(),
          lastFetchStatus: 'success',
        });
      });

      const { result } = renderHook(() => useConfigValue('raw_key'));

      expect(result.current).toBe('raw_value');
    });

    it('✅ returns undefined when key not found', () => {
      const { result } = renderHook(() => useConfigValue('non_existent'));

      expect(result.current).toBeUndefined();
    });
  });

  it('✅ semantic: all hooks update when config changes', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: {
          bool_key: 'false',
          string_key: 'old',
          number_key: '10',
        },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result: boolResult } = renderHook(() => useConfigBoolean('bool_key'));
    const { result: stringResult } = renderHook(() => useConfigString('string_key'));
    const { result: numberResult } = renderHook(() => useConfigNumber('number_key'));

    expect(boolResult.current).toBe(false);
    expect(stringResult.current).toBe('old');
    expect(numberResult.current).toBe(10);

    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: {
          bool_key: 'true',
          string_key: 'new',
          number_key: '20',
        },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    expect(boolResult.current).toBe(true);
    expect(stringResult.current).toBe('new');
    expect(numberResult.current).toBe(20);
  });
});
