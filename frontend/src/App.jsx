import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

// ==========================================
// 1. HALAMAN PEMBELI (USER) & CHECKOUT
// ==========================================
function Home() {
  const [games, setGames] = useState([])
  useEffect(() => { axios.get('http://127.0.0.1:5000/api/games').then(res => setGames(res.data.data)) }, [])
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Pilih Game</h2>
      {games.length === 0 ? (
        <div className="text-center p-10 bg-gray-800 rounded-xl border border-dashed border-gray-600">
          <p className="text-gray-400">Belum ada game. Silakan minta Admin menambahkannya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {games.map(game => (
            <Link key={game.id} to={`/game/${game.slug}`} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 block text-center transition">
              <img src={game.image_url || 'https://via.placeholder.com/150'} className="h-32 w-full object-cover rounded-lg mb-4" alt={game.name}/>
              <h3 className="font-semibold">{game.name}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GameDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [game, setGame] = useState(null)
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])
  
  const [accountInputs, setAccountInputs] = useState({})
  
  const [contact, setContact] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState(null)
  
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  
  const [showModal, setShowModal] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/games/${slug}`).then(res => {
      setGame(res.data.data.game)
      setProducts(res.data.data.products)
      setPayments(res.data.data.payments)
    }).catch(() => alert('Gagal memuat detail game'))
  }, [slug])

  const subTotal = selectedProduct ? selectedProduct.price * qty : 0
  const fee = selectedPayment ? selectedPayment.fee : 0
  const grandTotal = subTotal + fee - discount

  const requiredFields = game?.account_fields ? game.account_fields.split(',').map(f => f.trim()) : ['User ID']

  const handleInputChange = (field, value) => {
    setAccountInputs(prev => ({ ...prev, [field]: value }))
  }

  const applyPromo = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/check-promo', { code: promoCode, subtotal: subTotal })
      setDiscount(res.data.discount)
      alert('Promo berhasil digunakan!')
    } catch (e) { 
      alert(e.response?.data?.message || 'Kode Promo tidak valid.') 
    }
  }

  const handleOpenModal = () => {
    const allFieldsFilled = requiredFields.every(field => accountInputs[field] && accountInputs[field].trim() !== '')
    if (!allFieldsFilled || !contact || !selectedProduct || !selectedPayment) {
      return alert("Mohon lengkapi semua kolom Data Akun, Item, Kontak, dan Metode Pembayaran!")
    }
    setShowModal(true)
  }

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const accountDataString = requiredFields.map(field => `${field}: ${accountInputs[field]}`).join(' | ')

      const payload = {
        account_data: accountDataString,
        contact: contact, 
        qty: qty,
        game_name: game.name,
        product_name: selectedProduct.name,
        payment_method: selectedPayment.name,
        total_price: grandTotal
      }
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post('http://127.0.0.1:5000/api/checkout', payload, { headers })
      
      navigate(`/invoice/${res.data.invoice.replace('#', '%23')}`) 
    } catch (e) { 
      alert("Terjadi kesalahan sistem saat membuat pesanan") 
    }
  }

  if (!game) return <div className="p-10 text-center">Memuat...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <img src={game.image_url} className="h-24 w-24 rounded-lg object-cover shadow" alt={game.name} />
        <div>
          <h2 className="text-3xl font-extrabold text-blue-500">{game.name}</h2>
          <p className="text-gray-400 text-sm mt-1">Lengkapi data di bawah untuk melakukan top-up</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-[2] space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="font-bold mb-4 text-lg border-b border-gray-700 pb-2">1. Masukkan Data Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requiredFields.map(field => (
                <div key={field}>
                  <label className="text-xs text-gray-400 mb-1 block">{field}</label>
                  <input 
                    type="text" 
                    placeholder={`Masukkan ${field}`} 
                    required 
                    className="w-full p-3 bg-gray-900 border border-gray-700 focus:border-blue-500 rounded outline-none transition text-white" 
                    value={accountInputs[field] || ''} 
                    onChange={e => handleInputChange(field, e.target.value)} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="font-bold mb-4 text-lg border-b border-gray-700 pb-2">2. Pilih Item</h3>
            <div className="grid grid-cols-2 gap-4">
              {products.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)} 
                  className={`p-4 border rounded-xl cursor-pointer text-center transition-all duration-200 ${selectedProduct?.id === p.id ? 'border-blue-500 bg-blue-900/30 scale-[1.02]' : 'border-gray-600 bg-gray-900 hover:border-gray-400'}`}
                >
                  <img src={p.image_url || game.image_url} className="h-14 w-14 object-cover mx-auto rounded mb-2" alt={p.name} />
                  <div className="font-bold text-gray-100">{p.name}</div>
                  <div className="text-sm text-gray-400 mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
            
            {selectedProduct && (
              <div className="mt-6 flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-700">
                <span className="font-medium text-gray-300">Jumlah Pembelian:</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded font-bold transition">-</button>
                  <span className="font-bold text-lg w-4 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q+1)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded font-bold transition">+</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="font-bold mb-4 text-lg border-b border-gray-700 pb-2">3. Metode Pembayaran</h3>
            <div className="space-y-3">
              {payments.map(pm => (
                <div 
                  key={pm.id} 
                  onClick={() => setSelectedPayment(pm)} 
                  className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedPayment?.id === pm.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 bg-gray-900 hover:border-gray-400'}`}
                >
                  <span className="font-bold text-gray-200">{pm.name}</span>
                  <div className="text-right">
                    {subTotal > 0 && <div className="text-sm font-bold text-blue-400 mb-1">Rp {(subTotal + pm.fee).toLocaleString('id-ID')}</div>}
                    <span className="text-xs text-gray-400">Biaya Admin: +Rp {pm.fee}</span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada metode pembayaran untuk game ini.</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="font-bold mb-4 text-lg border-b border-gray-700 pb-2">Kode Promo</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Masukkan kode" 
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded outline-none focus:border-blue-500" 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value)} 
              />
              <button onClick={applyPromo} className="bg-green-600 hover:bg-green-700 px-4 rounded font-bold transition">Klaim</button>
            </div>
            {discount > 0 && <p className="text-green-400 text-sm mt-3 font-semibold">Diskon Aktif: -Rp {discount.toLocaleString('id-ID')}</p>}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 sticky top-24">
            <h3 className="font-bold mb-4 text-lg border-b border-gray-700 pb-2">Detail Tagihan</h3>
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-1 block">Nomor WhatsApp</label>
              <input 
                type="text" 
                placeholder="Contoh: 08123456789" 
                required 
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded outline-none focus:border-blue-500" 
                value={contact} 
                onChange={e => setContact(e.target.value)} 
              />
              <p className="text-[10px] text-gray-500 mt-1">*Bukti pembayaran akan dikirim ke nomor ini</p>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-300"><span>Subtotal:</span> <span>Rp {subTotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between text-sm text-gray-300"><span>Biaya Admin:</span> <span>Rp {fee.toLocaleString('id-ID')}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-400"><span>Diskon:</span> <span>-Rp {discount.toLocaleString('id-ID')}</span></div>}
              <div className="flex justify-between font-bold text-xl text-blue-400 pt-2 border-t border-gray-700 mt-2">
                <span>Total:</span> <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button onClick={handleOpenModal} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold shadow-lg transition duration-200">Beli Sekarang</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-600 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-3">Konfirmasi Pesanan</h2>
            <div className="space-y-3 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-700 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Game:</span> <span className="font-bold text-white">{game.name}</span></div>
              
              {requiredFields.map(field => (
                <div key={field} className="flex justify-between">
                  <span className="text-gray-400">{field}:</span> 
                  <span className="font-bold text-blue-400">{accountInputs[field]}</span>
                </div>
              ))}

              <div className="flex justify-between"><span className="text-gray-400">Item:</span> <span className="font-bold text-white">{selectedProduct?.name} (x{qty})</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Metode:</span> <span className="font-bold text-white">{selectedPayment?.name}</span></div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-700 text-blue-400 mt-2">
                <span>Total Bayar:</span> <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-6 bg-gray-900/50 p-3 rounded-lg">
              <input type="checkbox" id="tnc" className="mt-1 w-4 h-4 cursor-pointer accent-blue-500" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="tnc" className="text-sm text-gray-300 cursor-pointer select-none">
                Data yang saya masukkan sudah benar. Saya menyetujui <span className="text-blue-500 underline hover:text-blue-400">Syarat & Ketentuan</span>.
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 p-3 rounded-lg font-bold transition">Kembali</button>
              <button 
                onClick={handleCheckout} 
                disabled={!agreed} 
                className={`flex-1 p-3 rounded-lg font-bold transition shadow-lg ${agreed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-900/50 text-gray-500 cursor-not-allowed border border-gray-700'}`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InvoicePage() {
  const { id } = useParams()
  const [timeLeft, setTimeLeft] = useState(120)
  
  const [payStatus, setPayStatus] = useState('Loading')
  const [orderStatus, setOrderStatus] = useState('')
  
  const [invoiceData, setInvoiceData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  let cleanId = id ? decodeURIComponent(id) : ''
  if (cleanId && !cleanId.startsWith('#')) {
    cleanId = '#' + cleanId
  }

  useEffect(() => {
    if (!cleanId) return

    axios.get(`http://127.0.0.1:5000/api/invoice/${encodeURIComponent(cleanId)}`)
      .then(res => {
        setPayStatus(res.data.data.payment_status)
        setOrderStatus(res.data.data.order_status)
        setInvoiceData(res.data.data)
      })
      .catch(() => setPayStatus('Error'))
  }, [cleanId])

  useEffect(() => {
    if (payStatus === 'UNPAID' && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timerId)
    } else if (payStatus === 'UNPAID' && timeLeft <= 0) {
      setPayStatus('EXPIRED')
      setOrderStatus('FAILED')
      axios.post(`http://127.0.0.1:5000/api/checkout/${encodeURIComponent(cleanId)}/expire`).catch(() => {})
    }
  }, [timeLeft, payStatus, cleanId])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleSimulatePayment = async () => {
    setIsProcessing(true)
    try {
      await axios.post(`http://127.0.0.1:5000/api/checkout/${encodeURIComponent(cleanId)}/pay`)
      setPayStatus('PAID')
      setOrderStatus('PROCESSING')
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal simulasi pembayaran')
    }
    setIsProcessing(false)
  }

  if (payStatus === 'Loading') return <div className="text-center mt-20 text-gray-400">Memuat detail tagihan...</div>
  if (payStatus === 'Error') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-xl text-center border border-red-500 text-white shadow-xl">
        <h3 className="text-xl font-bold text-red-400 mb-2">Invoice Tidak Ditemukan</h3>
        <p className="text-sm text-gray-300 mb-4">Nomor invoice <span className="font-mono text-yellow-400">{cleanId}</span> tidak terdaftar di database.</p>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold transition">Kembali ke Beranda</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-xl text-center border border-gray-700 shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-2">Detail Tagihan</h2>
      <p className="text-gray-400 mb-6 font-mono bg-gray-900 p-2 rounded">No. Invoice: {cleanId}</p>
      
      {invoiceData && (
        <div className="bg-gray-900 p-4 rounded mb-6 text-left text-sm border border-gray-700 space-y-1">
          <div className="flex justify-between"><span className="text-gray-400">Game:</span> <span className="font-bold">{invoiceData.game_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Item:</span> <span className="font-bold">{invoiceData.product_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Metode:</span> <span className="font-bold">{invoiceData.payment_method}</span></div>
          <div className="flex justify-between pt-2 border-t border-gray-700 text-base text-blue-400 font-bold">
            <span>Total:</span> <span>Rp {invoiceData.total_price.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}
      
      {payStatus === 'UNPAID' && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Selesaikan pembayaran dalam:</p>
            <div className="text-4xl font-extrabold text-red-500 tracking-wider">
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl inline-block mb-6 relative">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DummyQRIS-${cleanId}`} alt="QRIS" className="rounded"/>
          </div>
          <button 
            onClick={handleSimulatePayment} disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-bold mb-4 transition text-white shadow"
          >
            {isProcessing ? 'Memproses...' : 'Simulasikan Pembayaran (Sudah Bayar)'}
          </button>
        </>
      )}

      {payStatus === 'PAID' && orderStatus === 'PROCESSING' && (
        <div className="p-6 bg-yellow-900/30 border border-yellow-500 rounded-xl mb-6 text-left space-y-2">
          <h3 className="text-lg font-bold text-yellow-400 text-center">Menunggu Diproses Admin</h3>
          <div className="text-sm space-y-1 border-t border-yellow-500/30 pt-2 text-gray-300">
            <div className="flex justify-between"><span>Payment Status:</span> <span className="font-bold text-green-400">PAID</span></div>
            <div className="flex justify-between"><span>Order Status:</span> <span className="font-bold text-yellow-400">PROCESSING</span></div>
          </div>
          <p className="text-xs text-gray-400 pt-2 text-center">Uang kamu sudah masuk. Admin sedang mengirim item ke akun game.</p>
        </div>
      )}

      {payStatus === 'PAID' && orderStatus === 'SUCCESS' && (
        <div className="p-6 bg-green-900/30 border border-green-500 rounded-xl mb-6 text-left space-y-2">
          <h3 className="text-lg font-bold text-green-400 text-center">Transaksi Berhasil!</h3>
          <div className="text-sm space-y-1 border-t border-green-500/30 pt-2 text-gray-300">
            <div className="flex justify-between"><span>Payment Status:</span> <span className="font-bold text-green-400">PAID</span></div>
            <div className="flex justify-between"><span>Order Status:</span> <span className="font-bold text-green-400">SUCCESS</span></div>
          </div>
          <p className="text-xs text-gray-400 pt-2 text-center">Item telah berhasil dimasukkan ke dalam akun game kamu.</p>
        </div>
      )}

      {(payStatus === 'EXPIRED' || orderStatus === 'FAILED') && (
        <div className="p-6 bg-red-900/30 border border-red-500 rounded-xl mb-6 text-left space-y-2">
          <h3 className="text-lg font-bold text-red-400 text-center">Transaksi Gagal / Kadaluarsa</h3>
          <div className="text-sm space-y-1 border-t border-red-500/30 pt-2 text-gray-300">
            <div className="flex justify-between"><span>Payment Status:</span> <span className="font-bold text-red-400">{payStatus}</span></div>
            <div className="flex justify-between"><span>Order Status:</span> <span className="font-bold text-red-400">{orderStatus}</span></div>
          </div>
          <p className="text-xs text-gray-400 pt-2 text-center">Batas waktu pembayaran telah habis atau dibatalkan.</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Link to="/" className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition text-white">Beranda</Link>
        <Link to="/riwayat" className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition text-white">Cek Riwayat</Link>
      </div>
    </div>
  )
}

// ==========================================
// 2. HALAMAN RIWAYAT TRANSAKSI USER
// ==========================================
function UserTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    const username = localStorage.getItem('username')

    if (token && username) {
      setIsLoggedIn(true)
      axios.get('http://127.0.0.1:5000/api/user/transactions', { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      .then(res => {
        setTransactions(res.data.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Gagal memuat riwayat:", err)
        if (err.response?.status === 401) {
          localStorage.removeItem('user_token')
          localStorage.removeItem('username')
          setIsLoggedIn(false)
        }
        setLoading(false)
      })
    } else {
      setIsLoggedIn(false)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="max-w-4xl mx-auto mt-20 text-center text-gray-400">Memuat riwayat transaksi...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-gray-800 rounded-xl text-center border border-gray-700 space-y-4 shadow-xl text-white">
        <h2 className="text-xl font-bold text-yellow-400">Akses Dibatasi</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Harap login terlebih dahulu untuk dapat melihat riwayat transaksi Anda.
        </p>
        <Link to="/user/login" className="inline-block w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition text-white">
          Login / Buat Akun User
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-white">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold">Riwayat Transaksi Saya</h2>
        <span className="text-sm text-yellow-400 font-semibold">Akun: {localStorage.getItem('username')}</span>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl text-center border border-gray-700">
          <p className="text-gray-400 mb-4">Belum ada riwayat transaksi yang tercatat di akun ini.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold text-sm transition">
            Mulai Top-up Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(t => (
            <Link 
              to={`/invoice/${t.invoice.replace('#', '%23')}`} 
              key={t.invoice} 
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-blue-500 hover:bg-gray-750 transition block cursor-pointer gap-4 shadow-md"
            >
              <div>
                <div className="text-sm text-blue-400 font-mono font-bold">{t.invoice}</div>
                <div className="text-lg font-semibold mt-1">{t.product_name} (x{t.qty})</div>
                
                <div className="text-xs text-gray-400 mt-2 space-y-1">
                  <div>Data Akun: <span className="text-white font-mono bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">{t.account_data}</span></div>
                  <div>Metode: <span className="text-gray-200">{t.payment_method}</span></div>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-700">
                <div className="font-bold text-green-400 text-lg">Rp {t.total_price.toLocaleString('id-ID')}</div>
                <div className="flex gap-1 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                    Pay: {t.payment_status}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.order_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : t.order_status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                    Order: {t.order_status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 3. HALAMAN LOGIN & REGISTER USER
// ==========================================
function UserAuth() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    const endpoint = isLoginMode ? '/api/user/login' : '/api/user/register'
    try {
      const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, { username, password })
      if (isLoginMode) {
        localStorage.setItem('user_token', res.data.token)
        localStorage.setItem('username', res.data.username)
        alert('Login Berhasil!')
        window.location.href = '/' 
      } else {
        alert('Registrasi Berhasil! Silakan Login.')
        setIsLoginMode(true)
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl mt-12 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">{isLoginMode ? 'Login User' : 'Daftar Akun User Baru'}</h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <input type="text" placeholder="Username" required className="w-full p-3 bg-gray-900 rounded" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" required className="w-full p-3 bg-gray-900 rounded" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-700">{isLoginMode ? 'Masuk' : 'Daftar'}</button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4 cursor-pointer hover:underline" onClick={() => setIsLoginMode(!isLoginMode)}>
        {isLoginMode ? 'Belum punya akun? Daftar disini' : 'Sudah punya akun? Login'}
      </p>
    </div>
  )
}

// ==========================================
// 4. HALAMAN ADMIN
// ==========================================
function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/admin/login', { username, password })
      localStorage.setItem('admin_token', res.data.token)
      navigate('/admin/dashboard')
    } catch (error) { alert('Login Admin gagal!') }
  }
  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl mt-10 border border-red-500/30">
      <h2 className="text-2xl font-bold mb-6 text-center text-red-400">Login khusus Admin</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="text" placeholder="Username Admin" className="w-full p-3 bg-gray-900 rounded" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password Admin" className="w-full p-3 bg-gray-900 rounded" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-red-600 p-3 rounded font-bold hover:bg-red-700">Masuk Dashboard Admin</button>
      </form>
    </div>
  )
}

function AdminDashboard() {
  const [games, setGames] = useState([])
  const [promos, setPromos] = useState([])
  const [payments, setPayments] = useState([])
  const [transactions, setTransactions] = useState([]) 
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const token = localStorage.getItem('admin_token')

  const [editGameId, setEditGameId] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [accountFields, setAccountFields] = useState('User ID')
  const [imageFile, setImageFile] = useState(null)

  const [editProdId, setEditProdId] = useState(null)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodImageFile, setProdImageFile] = useState(null)

  const [editPayId, setEditPayId] = useState(null)
  const [payGameId, setPayGameId] = useState('')
  const [payName, setPayName] = useState('')
  const [payFee, setPayFee] = useState('')

  const [editPromoId, setEditPromoId] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState('')
  const [promoMinSpend, setPromoMinSpend] = useState('')
  const [promoActive, setPromoActive] = useState(true)

  const fetchData = () => {
    axios.get('http://127.0.0.1:5000/api/games').then(res => setGames(res.data.data))
    axios.get('http://127.0.0.1:5000/api/admin/promos', { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setPromos(res.data.data)).catch(() => {})
    axios.get('http://127.0.0.1:5000/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setPayments(res.data.data)).catch(() => {})
    axios.get('http://127.0.0.1:5000/api/admin/transactions', { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setTransactions(res.data.data)).catch(() => {})
  }

  useEffect(() => { fetchData() }, [])

  const updateOrderStatus = async (id, status) => {
    if (!window.confirm(`Tandai pesanan ini sebagai ${status}?`)) return
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/transactions/${id}/status`, { order_status: status }, { headers: { Authorization: `Bearer ${token}` } })
      fetchData() 
    } catch (e) {
      alert('Gagal mengubah status pesanan')
    }
  }

  const today = new Date();
  const successfulTransactions = transactions.filter(t => t.payment_status === 'PAID' || t.order_status === 'SUCCESS');
  
  const dailyRevenue = successfulTransactions
    .filter(t => new Date(t.created_at || Date.now()).toDateString() === today.toDateString())
    .reduce((sum, t) => sum + t.total_price, 0);

  const monthlyRevenue = successfulTransactions
    .filter(t => new Date(t.created_at || Date.now()).getMonth() === today.getMonth() && new Date(t.created_at || Date.now()).getFullYear() === today.getFullYear())
    .reduce((sum, t) => sum + t.total_price, 0);

  const yearlyRevenue = successfulTransactions
    .filter(t => new Date(t.created_at || Date.now()).getFullYear() === today.getFullYear())
    .reduce((sum, t) => sum + t.total_price, 0);

  const handleSaveGame = async (e) => {
    e.preventDefault(); const formData = new FormData();
    formData.append('name', name); formData.append('slug', slug); formData.append('account_fields', accountFields);
    if (imageFile) formData.append('image', imageFile)
    if (editGameId) await axios.put(`http://127.0.0.1:5000/api/admin/games/${editGameId}`, formData)
    else await axios.post('http://127.0.0.1:5000/api/admin/games', formData)
    setEditGameId(null); setName(''); setSlug(''); setAccountFields('User ID'); setImageFile(null); fetchData();
  }

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Hapus game ini beserta seluruh item di dalamnya?")) return
    await axios.delete(`http://127.0.0.1:5000/api/admin/games/${id}`)
    fetchData()
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault(); const formData = new FormData();
    formData.append('game_id', selectedGameId); formData.append('name', prodName); formData.append('price', prodPrice);
    if (prodImageFile) formData.append('image', prodImageFile)
    if (editProdId) await axios.put(`http://127.0.0.1:5000/api/admin/products/${editProdId}`, formData)
    else await axios.post('http://127.0.0.1:5000/api/admin/products', formData)
    setEditProdId(null); setSelectedGameId(''); setProdName(''); setProdPrice(''); setProdImageFile(null); fetchData();
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Hapus item ini?")) return
    await axios.delete(`http://127.0.0.1:5000/api/admin/products/${id}`)
    fetchData()
  }

  const handleSavePayment = async (e) => {
    e.preventDefault();
    const payload = { game_id: payGameId || null, name: payName, fee: payFee || 0 }
    if (editPayId) {
      await axios.put(`http://127.0.0.1:5000/api/admin/payments/${editPayId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
    } else {
      await axios.post('http://127.0.0.1:5000/api/admin/payments', payload, { headers: { Authorization: `Bearer ${token}` } })
    }
    setEditPayId(null); setPayName(''); setPayFee(''); setPayGameId(''); fetchData()
  }

  const startEditPayment = (pm) => {
    setEditPayId(pm.id)
    setPayName(pm.name)
    setPayFee(pm.fee)
    setPayGameId(pm.game_id || '')
  }

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Hapus metode pembayaran ini?")) return
    await axios.delete(`http://127.0.0.1:5000/api/admin/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchData()
  }

  const handleSavePromo = async (e) => {
    e.preventDefault()
    const payload = { code: promoCode, discount: promoDiscount, min_spend: promoMinSpend || 0, is_active: promoActive }
    if (editPromoId) await axios.put(`http://127.0.0.1:5000/api/admin/promos/${editPromoId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
    else await axios.post('http://127.0.0.1:5000/api/admin/promos', payload, { headers: { Authorization: `Bearer ${token}` } })
    setEditPromoId(null); setPromoCode(''); setPromoDiscount(''); setPromoMinSpend(''); setPromoActive(true); fetchData()
  }

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Hapus promo ini?")) return
    await axios.delete(`http://127.0.0.1:5000/api/admin/promos/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchData()
  }

  const startEditPromo = (pr) => {
    setEditPromoId(pr.id); setPromoCode(pr.code); setPromoDiscount(pr.discount); setPromoMinSpend(pr.min_spend); setPromoActive(pr.is_active)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 mt-6 text-white">
      <div className="print:hidden">
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex justify-between items-center shadow-lg mb-6">
          <h2 className="text-xl font-bold text-red-400">Dashboard Admin</h2>
          <span className="text-xs text-gray-400">Kredensial: admin / admin123</span>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            📦 Dashboard Master
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            ⚡ Pantauan Transaksi
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2.5 rounded-t-lg font-bold transition ${activeTab === 'reports' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            📊 Laporan Keuangan
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900 to-gray-900 p-6 rounded-xl border border-green-700/50 shadow-lg">
              <p className="text-sm text-green-300 font-semibold mb-1">Pendapatan Hari Ini</p>
              <h3 className="text-3xl font-bold text-white">Rp {dailyRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-6 rounded-xl border border-blue-700/50 shadow-lg">
              <p className="text-sm text-blue-300 font-semibold mb-1">Pendapatan Bulan Ini</p>
              <h3 className="text-3xl font-bold text-white">Rp {monthlyRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-gray-900 p-6 rounded-xl border border-purple-700/50 shadow-lg">
              <p className="text-sm text-purple-300 font-semibold mb-1">Pendapatan Tahun Ini</p>
              <h3 className="text-3xl font-bold text-white">Rp {yearlyRevenue.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-blue-400">{editGameId ? 'Edit Game' : 'Tambah Game'}</h3>
              <form onSubmit={handleSaveGame} className="space-y-3">
                <input type="text" placeholder="Nama Game" required className="w-full p-2 bg-gray-900 rounded text-sm" value={name} onChange={e => setName(e.target.value)} />
                <input type="text" placeholder="Slug (misal: mlbb)" required className="w-full p-2 bg-gray-900 rounded text-sm" value={slug} onChange={e => setSlug(e.target.value)} />
                <div>
                  <input type="text" placeholder="Format Kolom (misal: User ID,Zone ID)" required className="w-full p-2 bg-gray-900 rounded text-sm" value={accountFields} onChange={e => setAccountFields(e.target.value)} />
                  <p className="text-[10px] text-gray-400 mt-1">Pisahkan tiap kolom dengan koma (,)</p>
                </div>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-xs text-gray-400" />
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-bold transition">{editGameId ? 'Update' : 'Simpan'}</button>
                  {editGameId && <button type="button" onClick={() => {setEditGameId(null); setName(''); setSlug(''); setAccountFields('User ID')}} className="bg-gray-600 px-2 rounded text-xs">Batal</button>}
                </div>
              </form>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-green-400">{editProdId ? 'Edit Item' : 'Tambah Item'}</h3>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <select required className="w-full p-2 bg-gray-900 rounded text-sm outline-none" value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}>
                  <option value="">-- Pilih Game --</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input type="text" placeholder="Nama Item" required className="w-full p-2 bg-gray-900 rounded text-sm" value={prodName} onChange={e => setProdName(e.target.value)} />
                <input type="number" placeholder="Harga" required className="w-full p-2 bg-gray-900 rounded text-sm" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                <input type="file" accept="image/*" onChange={e => setProdImageFile(e.target.files[0])} className="w-full text-xs text-gray-400" />
                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-bold transition">{editProdId ? 'Update' : 'Tambah'}</button>
                  {editProdId && <button type="button" onClick={() => {setEditProdId(null); setProdName(''); setProdPrice(''); setSelectedGameId('')}} className="bg-gray-600 px-2 rounded text-xs">Batal</button>}
                </div>
              </form>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-purple-400">{editPayId ? 'Edit Pembayaran' : 'Tambah Pembayaran'}</h3>
              <form onSubmit={handleSavePayment} className="space-y-3">
                <select className="w-full p-2 bg-gray-900 rounded text-sm outline-none" value={payGameId} onChange={e => setPayGameId(e.target.value)}>
                  <option value="">-- Semua Game --</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input type="text" placeholder="Nama Metode (Misal: BCA)" required className="w-full p-2 bg-gray-900 rounded text-sm" value={payName} onChange={e => setPayName(e.target.value)} />
                <input type="number" placeholder="Biaya Admin" className="w-full p-2 bg-gray-900 rounded text-sm" value={payFee} onChange={e => setPayFee(e.target.value)} />
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm font-bold transition">{editPayId ? 'Update' : 'Simpan'}</button>
                  {editPayId && <button type="button" onClick={() => {setEditPayId(null); setPayName(''); setPayFee(''); setPayGameId('')}} className="bg-gray-600 px-2 rounded text-xs">Batal</button>}
                </div>
              </form>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold mb-3 text-yellow-400">{editPromoId ? 'Edit Promo' : 'Tambah Promo'}</h3>
              <form onSubmit={handleSavePromo} className="space-y-3">
                <input type="text" placeholder="Kode Promo" required className="w-full p-2 bg-gray-900 rounded text-sm uppercase" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                <input type="number" placeholder="Diskon (Rp)" required className="w-full p-2 bg-gray-900 rounded text-sm" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} />
                <input type="number" placeholder="Min. Belanja" className="w-full p-2 bg-gray-900 rounded text-sm" value={promoMinSpend} onChange={e => setPromoMinSpend(e.target.value)} />
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="activeCheck" checked={promoActive} onChange={e => setPromoActive(e.target.checked)} className="accent-yellow-500" />
                  <label htmlFor="activeCheck">Aktifkan Promo</label>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm font-bold text-black transition">{editPromoId ? 'Update' : 'Buat'}</button>
                  {editPromoId && <button type="button" onClick={() => {setEditPromoId(null); setPromoCode(''); setPromoDiscount('')}} className="bg-gray-600 px-2 rounded text-xs text-white">Batal</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
            <h2 className="text-xl font-bold">Kelola Game & Rincian Item</h2>
            <div className="space-y-4">
              {games.map(g => (
                <div key={g.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <div className="flex items-center gap-3">
                      <img src={g.image_url} className="h-10 w-10 rounded object-cover" alt={g.name} />
                      <div>
                        <span className="font-bold text-base text-blue-400">{g.name}</span>
                        <div className="text-xs text-gray-400">Format: {g.account_fields} | {g.products?.length || 0} Item</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {setEditGameId(g.id); setName(g.name); setSlug(g.slug); setAccountFields(g.account_fields || 'User ID')}} className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded text-xs font-bold hover:bg-yellow-600 hover:text-white transition">Edit Game</button>
                      <button onClick={() => handleDeleteGame(g.id)} className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition">Hapus Game</button>
                    </div>
                  </div>

                  <div className="pl-4 space-y-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Daftar Item:</p>
                    {g.products && g.products.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {g.products.map(prod => (
                          <div key={prod.id} className="bg-gray-800 p-2.5 rounded border border-gray-700 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-white">{prod.name}</div>
                              <div className="text-green-400">Rp {prod.price.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => {setEditProdId(prod.id); setSelectedGameId(g.id); setProdName(prod.name); setProdPrice(prod.price)}} className="bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded hover:bg-yellow-600 hover:text-white">Edit</button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-600 hover:text-white">Hapus</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Belum ada item untuk game ini.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-purple-400">Daftar Metode Pembayaran</h3>
              <div className="space-y-3">
                {payments.map(pm => (
                  <div key={pm.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-white">{pm.name}</span>
                      <div className="text-xs text-gray-400">Biaya Admin: Rp {pm.fee}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditPayment(pm)} className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition">Edit</button>
                      <button onClick={() => handleDeletePayment(pm.id)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Hapus</button>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada metode pembayaran.</p>}
              </div>
            </div>

            {/* DAFTAR KODE PROMO DENGAN STATUS AKTIF / NONAKTIF */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">Daftar Kode Promo</h3>
              <div className="space-y-3">
                {promos.map(pr => (
                  <div key={pr.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-yellow-300 font-mono">{pr.code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${pr.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {pr.is_active ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Diskon: Rp {pr.discount.toLocaleString('id-ID')} | Min: Rp {pr.min_spend.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditPromo(pr)} className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition">Edit</button>
                      <button onClick={() => handleDeletePromo(pr.id)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition">Hapus</button>
                    </div>
                  </div>
                ))}
                {promos.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada kode promo.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 print:hidden">
          <h2 className="text-xl font-bold mb-6 text-white">Antrean Transaksi Masuk</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-4 font-semibold">Waktu & Invoice</th>
                  <th className="p-4 font-semibold">Pesanan & Data Akun</th>
                  <th className="p-4 font-semibold">Total Harga</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi (Eksekusi)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4 align-top">
                      <div className="font-bold text-blue-400">{t.invoice}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(t.created_at || Date.now()).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-yellow-400">{t.game_name} - {t.product_name} (x{t.qty})</div>
                      <div className="text-[11px] text-gray-400 mt-1 bg-gray-900 p-1.5 rounded inline-block font-mono border border-gray-700">{t.account_data}</div>
                      <div className="text-xs text-gray-500 mt-1">Pembeli: {t.contact}</div>
                    </td>
                    <td className="p-4 align-top font-bold text-green-400">Rp {t.total_price.toLocaleString('id-ID')}</td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>PAY: {t.payment_status}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.order_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : t.order_status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>ORD: {t.order_status}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      {t.payment_status === 'PAID' && t.order_status === 'PROCESSING' ? (
                        <div className="flex flex-col gap-2">
                          <button onClick={() => updateOrderStatus(t.id, 'SUCCESS')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded text-xs transition">✅ Tandai Sukses</button>
                          <button onClick={() => updateOrderStatus(t.id, 'FAILED')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-xs transition">❌ Batalkan</button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">Belum ada transaksi.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white print:bg-white text-black p-8 rounded-xl shadow-lg border border-gray-200 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wider">Laporan Pendapatan</h1>
              <p className="text-gray-600 mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
            
            <button 
              onClick={() => window.print()} 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold transition print:hidden flex items-center gap-2 shadow-lg"
            >
              🖨️ Cetak PDF / Kertas
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Hari Ini</p>
              <h3 className="text-xl font-extrabold text-green-600">Rp {dailyRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Bulan Ini</p>
              <h3 className="text-xl font-extrabold text-blue-600">Rp {monthlyRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tahun Ini</p>
              <h3 className="text-xl font-extrabold text-purple-600">Rp {yearlyRevenue.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-4">Rincian Transaksi Sukses</h3>
          
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-y-2 border-gray-800">
                <th className="py-3 px-2 font-bold">Waktu</th>
                <th className="py-3 px-2 font-bold">Invoice</th>
                <th className="py-3 px-2 font-bold">Game & Item</th>
                <th className="py-3 px-2 font-bold">Kontak / User</th>
                <th className="py-3 px-2 font-bold text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {successfulTransactions.map((t, index) => (
                <tr key={t.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-2 text-gray-600">{new Date(t.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                  <td className="py-2 px-2 font-mono font-bold">{t.invoice}</td>
                  <td className="py-2 px-2">{t.game_name} - {t.product_name}</td>
                  <td className="py-2 px-2">{t.contact}</td>
                  <td className="py-2 px-2 font-bold text-right">Rp {t.total_price.toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {successfulTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500 italic border-b border-gray-200">
                    Belum ada data transaksi sukses yang bisa dicetak.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-b-2 border-gray-800">
                <td colSpan="4" className="py-3 px-2 text-right font-bold uppercase">Total Keseluruhan Pendapatan:</td>
                <td className="py-3 px-2 font-extrabold text-right text-lg text-gray-900">
                  Rp {successfulTransactions.reduce((sum, t) => sum + t.total_price, 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
            Dokumen ini dihasilkan secara otomatis oleh Sistem Admin. Sah dan valid tanpa tanda tangan.
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. KOMPONEN UTAMA (APP & NAVBAR)
// ==========================================
export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('username'))

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('username')
    setUsername(null)
    window.location.href = '/'
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-500">MyTopUp.id</Link>
            
            <div className="flex items-center gap-6">
              <Link to="/riwayat" className="text-sm text-gray-300 hover:text-white font-semibold">Riwayat Transaksi</Link>
              
              {username ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-yellow-400 font-bold">Halo, {username}</span>
                  <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700">Logout</button>
                </div>
              ) : (
                <Link to="/user/login" className="bg-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">Login User</Link>
              )}
            </div>
          </div>
        </header>

        <main className="pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:slug" element={<GameDetail />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="/riwayat" element={<UserTransactions />} />
            <Route path="/user/login" element={<UserAuth />} />
            
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}