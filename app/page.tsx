'use client';

import { useState } from 'react';
import { hesaplaPaylar } from '@/lib/inheritance';

interface Mirasci {
  es: boolean;
  cocuklar: string[];
  anne: boolean;
  baba: boolean;
  kardesler: string[];
}

interface Varlik {
  ad: string;
  deger: number;
  borc: number;
}

interface Sonuc {
  mirasci: string;
  pay: number;
  varlikAdi: string;
  tutar: string;
}

export default function Home() {
  const [varliklar, setVarliklar] = useState<Varlik[]>([
    { ad: 'Ev', deger: 500000, borc: 0 },
  ]);
  const [mirasci, setMirasci] = useState<Mirasci>({
    es: false,
    cocuklar: ['Çocuk 1'],
    anne: false,
    baba: false,
    kardesler: [],
  });
  const [results, setResults] = useState<Sonuc[]>([]);

  const hesapla = () => {
    const paylar = hesaplaPaylar(mirasci);
    const tumSonuclar: Sonuc[] = [];

    varliklar.forEach(varlik => {
      const netDeger = varlik.deger - varlik.borc;
      paylar.forEach(p => {
        tumSonuclar.push({
          mirasci: p.ad,
          pay: p.pay,
          varlikAdi: varlik.ad,
          tutar: ((netDeger * p.pay) / 100).toFixed(2),
        });
      });
    });

    setResults(tumSonuclar);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-amber-900 text-white py-8 px-6 text-center">
        <h1 className="text-4xl font-bold">🏛️ Türk Medeni Kanunu</h1>
        <p className="text-amber-100 mt-2">Miras Hesaplayıcı Web</p>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Varlıklar Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">💰 Varlıklar</h2>
          <div className="space-y-4">
            {varliklar.map((v, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 rounded">
                <input
                  type="text"
                  placeholder="Varlık Adı"
                  value={v.ad}
                  onChange={(e) => {
                    const newVarliklar = [...varliklar];
                    newVarliklar[i].ad = e.target.value;
                    setVarliklar(newVarliklar);
                  }}
                  className="px-3 py-2 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="number"
                  placeholder="Değer (TL)"
                  value={v.deger}
                  onChange={(e) => {
                    const newVarliklar = [...varliklar];
                    newVarliklar[i].deger = parseFloat(e.target.value) || 0;
                    setVarliklar(newVarliklar);
                  }}
                  className="px-3 py-2 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="number"
                  placeholder="Borç (TL)"
                  value={v.borc}
                  onChange={(e) => {
                    const newVarliklar = [...varliklar];
                    newVarliklar[i].borc = parseFloat(e.target.value) || 0;
                    setVarliklar(newVarliklar);
                  }}
                  className="px-3 py-2 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mirasçılar Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">👥 Mirasçılar</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mirasci.es}
                onChange={(e) => setMirasci({ ...mirasci, es: e.target.checked })}
                className="w-5 h-5 rounded text-amber-600"
              />
              <span className="text-gray-700">Eş</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mirasci.anne}
                onChange={(e) => setMirasci({ ...mirasci, anne: e.target.checked })}
                className="w-5 h-5 rounded text-amber-600"
              />
              <span className="text-gray-700">Anne</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mirasci.baba}
                onChange={(e) => setMirasci({ ...mirasci, baba: e.target.checked })}
                className="w-5 h-5 rounded text-amber-600"
              />
              <span className="text-gray-700">Baba</span>
            </label>

            <div className="mt-4 p-4 bg-amber-50 rounded">
              <label className="block text-gray-700 mb-2">Çocuklar:</label>
              {mirasci.cocuklar.map((c, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Çocuk ${i + 1}`}
                  value={c}
                  onChange={(e) => {
                    const newCocuklar = [...mirasci.cocuklar];
                    newCocuklar[i] = e.target.value;
                    setMirasci({ ...mirasci, cocuklar: newCocuklar });
                  }}
                  className="block w-full mb-2 px-3 py-2 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ))}
            </div>
          </div>

          <button
            onClick={hesapla}
            className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            💡 Hesapla
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">📊 Sonuçlar</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="text-left p-3 font-bold text-amber-900">Mirasçı</th>
                    <th className="text-left p-3 font-bold text-amber-900">Varlık</th>
                    <th className="text-left p-3 font-bold text-amber-900">Pay %</th>
                    <th className="text-left p-3 font-bold text-amber-900">Tutar (TL)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                      <td className="p-3 border-b border-amber-200">{r.mirasci}</td>
                      <td className="p-3 border-b border-amber-200">{r.varlikAdi}</td>
                      <td className="p-3 border-b border-amber-200">{r.pay.toFixed(2)}%</td>
                      <td className="p-3 border-b border-amber-200 font-semibold">
                        ₺{parseFloat(r.tutar).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
