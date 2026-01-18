import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Recipe } from '../types/Recipe';
import { loadBuiltInRecipesFromFirestore, clearBuiltInRecipesCache } from '../firebase/builtInRecipeSync';
import { setGlobalDocument } from '../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #333;
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const RecipeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const RecipeTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
`;

const ImagePreview = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 150px;
  border-radius: 8px;
  background: ${props => props.$hasImage ? 'transparent' : '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: #999;
    font-size: 14px;
  }
`;

const UploadButton = styled.label<{ $uploading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.$uploading ? '#ccc' : '#2C3E50'};
  color: white;
  border-radius: 8px;
  cursor: ${props => props.$uploading ? 'wait' : 'pointer'};
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$uploading ? '#ccc' : '#34495e'};
  }

  input {
    display: none;
  }
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'uploading' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  background: ${props => {
    switch (props.$status) {
      case 'success': return '#dcfce7';
      case 'error': return '#fee2e2';
      case 'uploading': return '#fef3c7';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'success': return '#166534';
      case 'error': return '#991b1b';
      case 'uploading': return '#92400e';
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
`;

export function AdminPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<Record<string, { status: 'uploading' | 'success' | 'error'; message: string }>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      clearBuiltInRecipesCache(); // Force fresh load
      const builtInRecipes = await loadBuiltInRecipesFromFirestore();
      setRecipes(builtInRecipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (recipeId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadStatus(prev => ({
        ...prev,
        [recipeId]: { status: 'error', message: 'Please select an image file' }
      }));
      return;
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus(prev => ({
        ...prev,
        [recipeId]: { status: 'error', message: 'Image must be under 2MB' }
      }));
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [recipeId]: { status: 'uploading', message: 'Uploading...' }
    }));

    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file, 800, 0.85);
      const compressedFile = new File([compressedBlob], `${recipeId}.jpg`, { type: 'image/jpeg' });

      // Upload to Firebase Storage
      const imageRef = ref(storage, `recipes/${recipeId}/image.jpg`);
      await uploadBytes(imageRef, compressedFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Update Firestore document
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        await setGlobalDocument('builtInRecipes', recipeId, {
          ...recipe,
          image: imageUrl,
          updatedAt: Date.now(),
        });

        // Update local state
        setRecipes(prev => prev.map(r =>
          r.id === recipeId ? { ...r, image: imageUrl } : r
        ));
      }

      setUploadStatus(prev => ({
        ...prev,
        [recipeId]: { status: 'success', message: 'Image uploaded!' }
      }));

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => {
          const updated = { ...prev };
          delete updated[recipeId];
          return updated;
        });
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(prev => ({
        ...prev,
        [recipeId]: { status: 'error', message: `Failed: ${(error as Error).message}` }
      }));
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
            hourglass_empty
          </span>
          Loading recipes...
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/recipes')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </BackButton>
        <Title>Admin: Recipe Images</Title>
      </Header>

      <RecipeGrid>
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id}>
            <RecipeTitle>{recipe.title}</RecipeTitle>

            <ImagePreview $hasImage={!!recipe.image}>
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} />
              ) : (
                <span className="placeholder">No image</span>
              )}
            </ImagePreview>

            <UploadButton $uploading={uploadStatus[recipe.id]?.status === 'uploading'}>
              <span className="material-symbols-outlined">upload</span>
              {uploadStatus[recipe.id]?.status === 'uploading' ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                ref={el => fileInputRefs.current[recipe.id] = el}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(recipe.id, file);
                    e.target.value = ''; // Reset input
                  }
                }}
                disabled={uploadStatus[recipe.id]?.status === 'uploading'}
              />
            </UploadButton>

            {uploadStatus[recipe.id] && (
              <StatusBadge $status={uploadStatus[recipe.id].status}>
                {uploadStatus[recipe.id].message}
              </StatusBadge>
            )}
          </RecipeCard>
        ))}
      </RecipeGrid>
    </PageContainer>
  );
}

// Image compression utility
async function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
