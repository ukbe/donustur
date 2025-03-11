'use client';

import { useState, useEffect, useRef } from 'react';
import { TextField, Button, Flex, View } from '@aws-amplify/ui-react';
import { listUsers, getUser, updateUser, addUserToGroup, removeUserFromGroup, disableUser, enableUser, type User } from '@/lib/api';
import { useNotification } from '@/components/ui/NotificationContext';
import { PencilIcon, XCircleIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { showNotification } = useNotification();
  const router = useRouter();
  const authChecked = useRef(false);
  const errorNotificationShown = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (authChecked.current) return;
    
    async function checkAuth() {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
        
        // Store the current user ID
        if (session.tokens?.accessToken.payload.sub) {
          setCurrentUserId(session.tokens.accessToken.payload.sub as string);
        }
        
        if (!groups.includes('admin')) {
          showNotification('error', 'Yetkisiz Erişim', 'Bu sayfaya erişmek için admin yetkisine sahip olmalısınız.');
          router.replace('/');
          return;
        }
        
        loadUsers();
      } catch (error) {
        console.error('Authentication error:', error);
        showNotification('error', 'Kimlik Doğrulama Hatası', 'Oturum bilgileriniz alınamadı. Lütfen tekrar giriş yapın.');
        router.replace('/signin');
      } finally {
        // Mark auth as checked to prevent multiple calls
        authChecked.current = true;
      }
    }
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, showNotification]);

  // Effect to handle showing error notification only once
  useEffect(() => {
    if (error && !errorNotificationShown.current) {
      showNotification('error', 'Yükleme Hatası', error);
      errorNotificationShown.current = true;
    } else if (!error) {
      errorNotificationShown.current = false;
    }
  }, [error, showNotification]);

  async function loadUsers() {
    // If already loading or there was an error, prevent retries
    if (loading) return;
    
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('Loading users...');
      const usersList = await listUsers();
      console.log('Users loaded:', usersList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      
      // Extract GraphQL error messages if available
      let errorMessage = 'Kullanıcılar yüklenirken bir hata oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if this is an Amplify GraphQL error with permission denied
        if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException') || 
            errorMessage.includes('is not authorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Admin olarak giriş yaptığınızdan emin olun.';
        }
      }
      
      // Set error state instead of directly showing notification
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Start editing a user
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsEditing(true);
  };

  // Handle saving edited user
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) {
      setError('Düzenlenecek kullanıcı bulunamadı');
      return;
    }
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('Updating user with data:', editingUser);
      
      // Update the user
      const updatedUser = await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        credits: editingUser.credits,
      });
      
      if (updatedUser) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        
        // Close edit form
        setIsEditing(false);
        setEditingUser(null);
        
        // Show success notification
        showNotification('success', 'Başarılı', 'Kullanıcı başarıyla güncellendi');
      } else {
        throw new Error('Kullanıcı güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Extract GraphQL error messages if available
      let errorMessage = 'Bilinmeyen bir hata oluştu';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if this is an Amplify GraphQL error with permission denied
        if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException') || 
            errorMessage.includes('is not authorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Admin olarak giriş yaptığınızdan emin olun.';
        }
      }
      
      // Set error state instead of directly showing notification
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle user role management
  const handleRoleToggle = async (userId: string, groupName: string, action: 'add' | 'remove') => {
    // Prevent duplicate requests
    if (loading) return;
    
    // Prevent removing yourself from the admin group
    if (userId === currentUserId && action === 'remove' && groupName === 'admin') {
      setError('Kendinizi admin grubundan çıkaramazsınız. Bu işlem admin yetkilerinizi kaybetmenize neden olur.');
      return;
    }
    
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      if (action === 'add') {
        await addUserToGroup(userId, groupName);
      } else {
        await removeUserFromGroup(userId, groupName);
      }
      
      // Reload the user to get updated groups
      const updatedUser = await getUser(userId);
      if (updatedUser) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? updatedUser : user
          )
        );
        
        // Show success notification
        showNotification(
          'success', 
          'Rol Değişikliği', 
          `Kullanıcı ${action === 'add' ? 'gruba eklendi' : 'gruptan çıkarıldı'}`
        );
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      
      // Extract GraphQL error messages if available
      let errorMessage = 'Bilinmeyen bir hata oluştu';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if this is an Amplify GraphQL error with permission denied
        if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException') || 
            errorMessage.includes('is not authorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Admin olarak giriş yaptığınızdan emin olun.';
        }
      }
      
      // Set error state instead of directly showing notification
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle disable confirmation
  const handleDisableConfirm = (userId: string) => {
    // Prevent confirming disable for current user
    if (userId === currentUserId) {
      setError('Kendi hesabınızı devre dışı bırakamazsınız. Bu işlem admin yetkilerinizi kaybetmenize neden olur.');
      return;
    }
    
    setConfirmDisable(userId);
  };

  // Handle disable/enable user
  const handleDisableUser = async (userId: string, isEnabled: boolean | undefined) => {
    const currentlyEnabled = isEnabled !== false; // Treat undefined as enabled
    
    // Prevent duplicate requests
    if (loading) return;
    
    // Prevent disabling your own account
    if (userId === currentUserId && currentlyEnabled) {
      setError('Kendi hesabınızı devre dışı bırakamazsınız. Bu işlem admin yetkilerinizi kaybetmenize neden olur.');
      return;
    }
    
    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      if (!currentlyEnabled) {
        await enableUser(userId);
      } else {
        await disableUser(userId);
      }
      
      // Refresh the user list to get updated status
      await loadUsers();
      
      // Reset confirm state
      setConfirmDisable(null);
      
      // Show success notification
      showNotification(
        'success', 
        'Durum Değişikliği', 
        `Kullanıcı ${!currentlyEnabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`
      );
    } catch (error) {
      console.error('Error changing user status:', error);
      
      // Extract GraphQL error messages if available
      let errorMessage = 'Bilinmeyen bir hata oluştu';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if this is an Amplify GraphQL error with permission denied
        if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException') || 
            errorMessage.includes('is not authorized')) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Admin olarak giriş yaptığınızdan emin olun.';
        }
      }
      
      // Set error state instead of directly showing notification
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sistem kullanıcılarını görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            onClick={() => loadUsers()}
            backgroundColor="green"
            color="white"
            isLoading={loading}
          >
            Yenile
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && editingUser && (
        <View as="form" onSubmit={handleEditSave} className="mb-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Kullanıcı Adı"
              name="username"
              value={editingUser.username}
              isReadOnly
            />
            <TextField
              label="E-posta"
              name="email"
              type="email"
              required
              value={editingUser.email || ''}
              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
            />
            <TextField
              label="İsim"
              name="name"
              value={editingUser.name || ''}
              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
            />
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              required
              value={editingUser.credits}
              onChange={(e) => setEditingUser({...editingUser, credits: parseInt(e.target.value, 10)})}
            />
            <Flex justifyContent="flex-end" gap="0.5rem">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditingUser(null);
                }}
                backgroundColor="transparent"
                color="black"
              >
                İptal
              </Button>
              <Button type="submit" backgroundColor="green" color="white" isLoading={loading}>
                Güncelle
              </Button>
            </Flex>
          </Flex>
        </View>
      )}

      {/* Users List */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Kullanıcı Adı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-posta</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">İsim</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Puanlar</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roller</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-gray-500">Yükleniyor...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <p className="text-sm text-gray-500">Henüz kullanıcı bulunmuyor.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.username || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.email || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.name || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.credits}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {user.userGroups.map((group) => (
                              <span 
                                key={group}
                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                              >
                                {group}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-md ${
                            user.enabled !== false
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : 'bg-red-50 text-red-700 ring-red-600/20'
                          } px-2 py-1 text-xs font-medium ring-1 ring-inset`}>
                            {user.enabled !== false ? 'aktif' : 'pasif'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {confirmDisable === user.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => setConfirmDisable(null)}
                                backgroundColor="white"
                                color="black"
                                border="1px solid #d1d5db"
                                size="small"
                                isDisabled={loading}
                              >
                                İptal
                              </Button>
                              <Button
                                onClick={() => handleDisableUser(user.id, user.enabled !== false)}
                                backgroundColor="red"
                                color="white"
                                size="small"
                                isLoading={loading}
                                isDisabled={loading}
                              >
                                Devre Dışı Bırak
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditClick(user)}
                                className="rounded bg-white p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Düzenle"
                                disabled={loading}
                              >
                                <PencilIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                <span className="sr-only">Düzenle</span>
                              </button>
                              
                              {/* Admin role toggle button */}
                              <button
                                type="button"
                                onClick={() => handleRoleToggle(user.id, 'admin', user.userGroups.includes('admin') ? 'remove' : 'add')}
                                className={`rounded bg-white p-1 ${
                                  user.userGroups.includes('admin') 
                                    ? 'text-blue-600 hover:text-blue-800' 
                                    : 'text-gray-400 hover:text-blue-600'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  (loading || user.id === currentUserId) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title={user.userGroups.includes('admin') ? 'Admin rolünü kaldır' : 'Admin rolünü ekle'}
                                disabled={loading || user.id === currentUserId}
                              >
                                <ShieldCheckIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                <span className="sr-only">
                                  {user.userGroups.includes('admin') ? 'Admin rolünü kaldır' : 'Admin rolünü ekle'}
                                </span>
                              </button>
                              
                              {/* Enable/Disable button */}
                              <button
                                type="button"
                                onClick={() => handleDisableConfirm(user.id)}
                                className="rounded bg-white p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                title={user.enabled !== false ? 'Devre dışı bırak' : 'Aktif et'}
                                disabled={loading || user.id === currentUserId}
                              >
                                {user.enabled !== false ? (
                                  <XCircleIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                ) : (
                                  <CheckCircleIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                )}
                                <span className="sr-only">
                                  {user.enabled !== false ? 'Devre dışı bırak' : 'Aktif et'}
                                </span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 