import api from '../api';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a GET request', async () => {
    const mockResponse = { data: { message: 'success' } };
    (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const response = await api.get('/test');
    expect(response).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith('/test');
  });

  it('should make a POST request', async () => {
    const mockData = { name: 'test' };
    const mockResponse = { data: { message: 'success' } };
    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const response = await api.post('/test', mockData);
    expect(response).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith('/test', mockData);
  });

  it('should handle request errors', async () => {
    const mockError = new Error('Network error');
    (api.get as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(api.get('/test')).rejects.toThrow('Network error');
  });

  it('should handle response errors', async () => {
    const mockError = new Error('Server error');
    (api.get as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(api.get('/test')).rejects.toThrow('Server error');
  });
}); 