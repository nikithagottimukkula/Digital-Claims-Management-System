import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Claim, ClaimFilters, ClaimFormData, StatusChangeRequest, PaginatedResponse } from '@/types';
import { claimsApi } from '@/utils/api';

interface ClaimsState {
  claims: Claim[];
  currentClaim: Claim | null;
  filters: ClaimFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: ClaimsState = {
  claims: [],
  currentClaim: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchClaims = createAsyncThunk(
  'claims/fetchClaims',
  async (params: { filters?: ClaimFilters; page?: number; limit?: number }) => {
    const response = await claimsApi.getClaims(params);
    return response.data;
  }
);

export const fetchClaimById = createAsyncThunk(
  'claims/fetchClaimById',
  async (id: string) => {
    const response = await claimsApi.getClaimById(id);
    return response.data;
  }
);

export const createClaim = createAsyncThunk(
  'claims/createClaim',
  async (claimData: ClaimFormData) => {
    const response = await claimsApi.createClaim(claimData);
    return response.data;
  }
);

export const updateClaimStatus = createAsyncThunk(
  'claims/updateClaimStatus',
  async ({ id, statusChange }: { id: string; statusChange: StatusChangeRequest }) => {
    const response = await claimsApi.updateClaimStatus(id, statusChange);
    return response.data;
  }
);

export const assignClaim = createAsyncThunk(
  'claims/assignClaim',
  async ({ claimId, adjusterId, priority }: { claimId: string; adjusterId: string; priority: string }) => {
    const response = await claimsApi.assignClaim({ claimId, adjusterId, priority });
    return response.data;
  }
);

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ClaimFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentClaim: (state, action: PayloadAction<Claim | null>) => {
      state.currentClaim = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateClaimInList: (state, action: PayloadAction<Claim>) => {
      const index = state.claims.findIndex(claim => claim.id === action.payload.id);
      if (index !== -1) {
        state.claims[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch claims
      .addCase(fetchClaims.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClaims.fulfilled, (state, action: PayloadAction<PaginatedResponse<Claim>>) => {
        state.isLoading = false;
        state.claims = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch claims';
      })
      // Fetch claim by ID
      .addCase(fetchClaimById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClaimById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClaim = action.payload;
      })
      .addCase(fetchClaimById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch claim';
      })
      // Create claim
      .addCase(createClaim.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createClaim.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.claims.unshift(action.payload);
      })
      .addCase(createClaim.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to create claim';
      })
      // Update claim status
      .addCase(updateClaimStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateClaimStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (state.currentClaim && state.currentClaim.id === action.payload.id) {
          state.currentClaim = action.payload;
        }
        const index = state.claims.findIndex(claim => claim.id === action.payload.id);
        if (index !== -1) {
          state.claims[index] = action.payload;
        }
      })
      .addCase(updateClaimStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to update claim status';
      })
      // Assign claim
      .addCase(assignClaim.fulfilled, (state, action) => {
        if (state.currentClaim && state.currentClaim.id === action.payload.claimId) {
          state.currentClaim.assignment = action.payload;
        }
      });
  },
});

export const { setFilters, clearFilters, setCurrentClaim, clearError, updateClaimInList } = claimsSlice.actions;
export default claimsSlice.reducer;
