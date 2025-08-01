export const useNetWorth = jest.fn(() => ({
  data: { netWorth: 0 },
  isLoading: false,
}));

export const useAssets = jest.fn(() => ({
  data: [],
  isLoading: false,
}));

export const useLiabilities = jest.fn(() => ({
  data: [],
  isLoading: false,
}));

export const useCreateAsset = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));

export const useUpdateAsset = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));

export const useDeleteAsset = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));

export const useCreateLiability = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));

export const useUpdateLiability = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));

export const useDeleteLiability = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
}));
