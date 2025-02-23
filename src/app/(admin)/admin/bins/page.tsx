'use client';

import {useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import {v4 as uuidv4} from 'uuid';
import {TextField, Button, Flex, View} from '@aws-amplify/ui-react';
import {createBin, type Bin} from '@/lib/api';

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    location: '',
    credits: 10,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const binId = uuidv4();
      const bin = await createBin({
        id: binId,
        name: newBin.name,
        location: newBin.location,
        credits: newBin.credits,
        status: 'active',
      });
      setBins([bin, ...bins]);
      setNewBin({name: '', location: '', credits: 10});
    } catch (error) {
      console.error('Error creating bin:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const downloadQR = (bin: Bin) => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector(`#qr-${bin.id}`)?.innerHTML;
    if (!svg) return;

    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `qr-${bin.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Geri Dönüşüm Kutuları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Geri dönüşüm kutularını yönetin ve QR kodlarını indirin.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsCreating(true)}
            className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            Yeni Kutu Ekle
          </button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <View as="form" onSubmit={handleCreate} className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Kutu Adı"
              name="name"
              required
              value={newBin.name}
              onChange={(e) => setNewBin({...newBin, name: e.target.value})}
            />
            <TextField
              label="Konum"
              name="location"
              required
              value={newBin.location}
              onChange={(e) => setNewBin({...newBin, location: e.target.value})}
            />
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              required
              value={newBin.credits}
              onChange={(e) => setNewBin({...newBin, credits: parseInt(e.target.value, 10)})}
            />
            <Flex justifyContent="flex-end" gap="0.5rem">
              <Button
                onClick={() => setIsCreating(false)}
              >
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </Flex>
          </Flex>
        </View>
      )}

      {/* Bins List */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Kutu Adı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Konum</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">QR Kod</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {bins.map((bin) => (
                    <tr key={bin.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {bin.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{bin.location}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div id={`qr-${bin.id}`} className="hidden">
                          <QRCodeSVG value={`${window.location.origin}/scan?bin=${bin.id}`} />
                        </div>
                        <button
                          onClick={() => downloadQR(bin)}
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          QR İndir
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {bin.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button className="text-green-600 hover:text-green-900">Düzenle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 