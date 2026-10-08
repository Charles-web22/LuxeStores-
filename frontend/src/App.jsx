
import React, { useState, useEffect } from 'react'
const COMMISSION_RATES = { default: 10, Fashion: 15, Electronics: 8, Phones: 8, Computing: 10, Beauty: 12, Supermarket: 5 }
const PRODUCTS = [
  {id:1,title:"iPhone 14 Pro Max 256GB - Space Black",price:1250000,oldPrice:1450000,img:"https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500",cat:"Phones",vendor:"TechHub NG",rating:4.8,stock:12},
  {id:2,title:"Nike Air Max 270 Sneakers - White",price:45000,oldPrice:65000,img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",cat:"Fashion",vendor:"StyleVille",rating:4.5,stock:30},
  {id:3,title:"LG 43 inch UHD Smart TV",price:189000,oldPrice:220000,img:"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",cat:"Electronics",vendor:"ElectroMart",rating:4.7,stock:8},
  {id:4,title:"L'Oreal Vitamin C Face Serum 30ml",price:8500,oldPrice:12000,img:"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",cat:"Beauty",vendor:"BeautyBay",rating:4.6,stock:50},
  {id:5,title:"Dell XPS 13 Laptop - 16GB/512GB",price:890000,oldPrice:950000,img:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",cat:"Computing",vendor:"TechHub NG",rating:4.9,stock:5},
  {id:6,title:"Ankara Men's Shirt - Premium",price:12000,oldPrice:18000,img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500",cat:"Fashion",vendor:"AnkaraWorld",rating:4.4,stock:20},
]
export default function App(){
  const [view,setView]=useState('store')
  const [auth,setAuth]=useState(()=>{try{return JSON.parse(localStorage.getItem('luxe_auth'))}catch{return null}})
  const [cart,setCart]=useState([])
  const [showCart,setShowCart]=useState(false)
  const [showCheckout,setShowCheckout]=useState(false)
  const [showLogin,setShowLogin]=useState(false)
  const [showReg,setShowReg]=useState(false)
  const [loginForm,setLoginForm]=useState({email:'',password:''})
  const [regForm,setRegForm]=useState({name:'',email:'',phone:'',password:'',role:'Customer'})
  const [search,setSearch]=useState('')
  const [selectedCat,setSelectedCat]=useState('All')
  const [products,setProducts]=useState(PRODUCTS)
  const [customerOrders,setCustomerOrders]=useState([{id:'ORD-001',title:'iPhone 14 Pro Max',
  status:'Paid - Escrow Hold',total:1250000,vendor:'TechHub NG',escrow:1150000,
  commission:100000,
  delivered:false
  },
  {
	  id:'ORD-002', title:'Nike Air Max 270', status:'Delivered', total:45000,vendor:'StyleVille',
	  escrow:38250, commission:6750, delivered:true
	  }
	  ]
	  )
  useEffect(()=>{if(auth)localStorage.setItem('luxe_auth',JSON.stringify(auth));
  else localStorage.removeItem('luxe_auth')},[auth])
  const cats=['All','Supermarket','Health & Beauty','Home & Office','Phones','Computing','Electronics','Fashion','Gaming','Baby Products']
  const filtered=products.filter(p=>(selectedCat==='All'||p.cat===selectedCat)&&p.title.toLowerCase().includes(search.toLowerCase()))
  const addToCart=(p)=>setCart(c=>{const ex=c.find(i=>i.id===p.id);return ex?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]})
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0)
  const commissionTotal=cart.reduce((s,i)=>s+(i.price*i.qty)*(COMMISSION_RATES[i.cat]||COMMISSION_RATES.default)/100,0)
  const shipping=cart.length?1500:0
  const grandTotal=cartTotal+shipping
  const handleLogin=(e)=>{
	  e.preventDefault();
  const role=loginForm.email.startsWith('vendor')?'Vendor':loginForm.email.startsWith('admin')?'Admin':'Customer';
  setAuth({name:role+' User',email:loginForm.email,role});
  setShowLogin(false)
  }
  const handleReg=(e)=>{e.preventDefault();
  setAuth({
	  name:regForm.name,
	  email:regForm.email,
	  role:regForm.role
	  });
  setShowReg(false)
  }
  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <div className="bg-[#f68b1e] text-white text-[11px] py-2 text-center font-bold tracking-wide">
		⚡ FLASH SALES EVERYDAY - FREE DELIVERY ON ORDERS OVER ₦20,000 | Call: 0700-600-0000
	  </div>
	  
//Header Section
      <header className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="font-black text-[26px] tracking-tighter">LUXE<span className="text-[#f68b1e]">.</span></div>
          <div className="flex-1 flex">
		  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands and categories" 
		  className="flex-1 border border-gray-300 rounded-l-md px-4 py-[11px] text-sm outline-none focus:border-[#f68b1e]"/>
		  <button className="bg-[#f68b1e] text-white px-7 rounded-r-md font-bold text-sm">
		  SEARCH
		  </button>
		  </div>
          <div className="flex items-center gap-5">
            <button onClick={()=>auth?null:setShowLogin(true)} className="flex items-center gap-2 text-sm font-semibold">
			<span className="w-8 h-8 bg-gray-100 rounded-full grid place-items-center">👤</span>
			{auth?`Hi, ${auth.name.split(' ')[0]}`:'Account'} ▾
			</button>
            <button onClick={()=>setShowCart(true)} className="flex items-center gap-2 text-sm font-semibold">
			🛒 Cart
			<span className="bg-[#f68b1e] text-white text-xs w-5 h-5 rounded-full grid place-items-center">
			{cart.reduce((a,b)=>a+b.qty,0)
			}
			</span>
			</button>
          </div>
        </div>
        <div className="border-t bg-white"><div className="max-w-[1280px] mx-auto px-4 py-1.5 flex gap-2 text-xs">
		<button onClick={()=>setView('store')} className={`px-4 py-1.5 rounded-full font-bold ${view==='store'?'bg-black text-white':'bg-gray-100'}`}>CUSTOMER STORE (Jumia UI)</button>
		<button onClick={()=>setView('vendor')} className={`px-4 py-1.5 rounded-full font-bold ${view==='vendor'?'bg-black text-white':'bg-gray-100'}`}>VENDOR DASHBOARD</button>
		<button onClick={()=>setView('admin')} className={`px-4 py-1.5 rounded-full font-bold ${view==='admin'?'bg-black text-white':'bg-gray-100'}`}>ADMIN PANEL</button>
		{auth&&<span className="ml-auto text-xs">Logged as {auth.role} | <span onClick={()=>setAuth(null)} className="text-red-500 cursor-pointer">Logout</span></span>}
		</div>
		</div>
      </header>
//Ends Header Section
	  
	  
//View Store Section
      {view==='store'&&(
        <div className="max-w-[1280px] mx-auto p-4 grid grid-cols-[230px_1fr] gap-4 mt-2">
          <aside className="bg-white rounded-md shadow-sm p-2 h-fit sticky top-[110px]">{cats.map(c=><div key={c} onClick={()=>setSelectedCat(c)} 
		  className={`py-[10px] px-3 text-[13px] cursor-pointer hover:text-[#f68b1e] flex justify-between ${selectedCat===c?'bg-[#fef3e8] 
		  text-[#f68b1e] font-bold rounded-md':''}`}><span>{c}</span><span>›</span></div>)}</aside>
          <main>
            <div className="bg-white rounded-md shadow-sm p-2 mb-3">
			<div className="bg-gradient-to-r from-[#f68b1e] to-[#ffad33] rounded-md p-6 md:p-8 text-white flex justify-between items-center">
			<div>
			<h1 className="text-2xl md:text-3xl font-black leading-tight">JUMIA-STYLE<br/>MEGA SALES</h1>
			<p className="text-sm mt-2 opacity-90">Up to 60% OFF + Free Delivery • Verified Vendors Only</p>
			<div className="mt-4 bg-black text-white inline-block px-5 py-2 rounded-md text-xs font-bold">SHOP NOW</div>
			</div>
			<div className="text-5xl hidden md:block">🛍️</div>
			</div>
			</div>
            <div className="bg-[#e61601] text-white rounded-t-md p-2.5 flex justify-between items-center text-sm font-bold">
			<span>⚡ Flash Sales - Live Now</span>
			<span className="text-xs font-normal">Time Left: 12:43:22 - SEE ALL ›</span>
			</div>
            <div className="bg-white rounded-b-md shadow-sm p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p=>(
                <div key={p.id} className="border border-gray-100 rounded-md p-2 hover:shadow-lg transition group cursor-pointer">
                  <div className="relative overflow-hidden rounded-md"><img src={p.img} className="h-[160px] w-full object-cover group-hover:scale-105 transition"/>
				  <span className="absolute top-1.5 right-1.5 bg-[#fef3e8] text-[#f68b1e] text-[11px] px-2 py-0.5 rounded font-bold">-{Math.round((1-p.price/p.oldPrice)*100)}%</span>
				  </div>
                  <div className="mt-2 text-[11px] text-gray-500 truncate">{p.vendor} • <span className="text-green-600 font-bold">Verified</span></div>
                  <div className="text-[13px] leading-tight line-clamp-2 h-9 mt-1">{p.title}</div>
                  <div className="font-bold text-sm mt-1">₦{p.price.toLocaleString()}</div>
                  <div className="text-[11px] line-through text-gray-400">₦{p.oldPrice.toLocaleString()}</div>
                  <div className="text-[11px] text-[#f68b1e] mt-0.5">{p.rating}★ ({Math.floor(Math.random()*200)+20} ratings)</div>
                  <button onClick={()=>addToCart(p)} className="mt-2.5 w-full bg-[#f68b1e] hover:bg-black text-white py-2 rounded-md text-xs font-bold transition">
				  ADD TO CART
				  </button>
                  <div className="text-[10px] mt-1.5 text-gray-400 bg-gray-50 p-1 rounded">
				  Commission {COMMISSION_RATES[p.cat]||10}% = ₦{Math.round(p.price*COMMISSION_RATES[p.cat]/100||p.price*0.1).toLocaleString()} → platform
				  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}
      
      {view==='store'&& auth && (
        <div className="max-w-[1280px] mx-auto px-4 mt-4">
          <div className="bg-white rounded-md shadow-sm p-4">
            <h3 className="font-black text-sm mb-3">📦 My Orders - Escrow Protected (Paystack)</h3>
            <div className="grid gap-3">
              {customerOrders.map(o=>(
                <div key={o.id} className="border rounded-md p-3 flex justify-between items-center text-sm">
                  <div>
				  <div className="font-bold">
				  {o.title} - {o.id}
				  </div>
				  <div className="text-xs text-gray-500">
				  Vendor: {o.vendor} | Status: 
				  <span className={`font-bold ${o.status.includes('Escrow')?'text-orange-500':o.status==='Delivered'?'text-blue-600':'text-green-600'}`}>
				  {o.status}
				  </span>
				  </div>
				  <div className="text-[11px] mt-1 bg-yellow-50 p-1.5 rounded">
				  Escrow Held: ₦{o.escrow?.toLocaleString()} → Vendor gets after you confirm. Commission: ₦{o.commission?.toLocaleString()}
				  </div>
				  </div>
                  <div className="flex flex-col gap-2">
                    {o.status==='Delivered'&&<button onClick={()=>{
						if(confirm('Confirm you received '+o.title+'? This will release ₦'+o.escrow?.toLocaleString()+' to vendor via Paystack Transfer.'
						)
						)
					{
						setCustomerOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:'Payout Completed',delivered:false}:x)); 
						alert('✅ Confirmed! Paystack Transfer initiated to vendor. Funds released from escrow.'
						)
						}
						} 
						className="bg-green-600 text-white px-4 py-2 rounded-md font-bold text-xs">✅ CONFIRM RECEIPT - RELEASE FUNDS</button>
						}
                    {o.status==='Paid - Escrow Hold'&&<span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
					⏳ Waiting for vendor to ship
					</span>
					}
                    {o.status==='Payout Completed'&&<span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
					✅ Completed - Funds released
					</span>
					}
                  </div>
                </div>
              )
			  )
			  }
            </div>
            <div className="text-[11px] text-gray-500 mt-3 bg-blue-50 p-2 rounded">
			🔒 How escrow works: 
			1) You pay → Paystack holds funds in platform balance 
			2) Vendor ships 
			3) You receive → Click Confirm Receipt 
			4) Backend calls Paystack Transfer API to pay vendor (vendorPayout = total - commission). Platform keeps commission.
			</div>
          </div>
        </div>
      )}

      {view==='vendor'&&(
        <div className="max-w-[1280px] mx-auto p-4 grid grid-cols-[250px_1fr] gap-4">
          <aside className="bg-white rounded-md p-4 shadow-sm text-sm space-y-3 h-fit">
		  <h3 className="font-black">Vendor Dashboard</h3><div className="space-y-2 mt-3 text-[13px]">
		  <div className="font-bold">📊 Overview</div>
		  <div>📦 Products ({products.length})</div>
		  <div>🧾 Orders</div>
		  <div className="font-bold text-[#f68b1e]">💰 Earnings (Net after 10%)</div>
		  <div>⭐ Reviews</div>
		  </div>
		  {
			  !auth||auth.role!=='Vendor'?
		  <div className="text-xs text-red-500 bg-red-50 p-2 rounded mt-4">
		  Login as vendor@demo.com / demo123
		  </div>:
		  <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
		  Logged as {auth.email}
		  </div>
		  }
		  </aside>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4"><div className="bg-white p-5 rounded-md shadow-sm">
			<div className="text-xs text-gray-500">Gross Sales</div>
			<div className="font-black text-xl">₦{cartTotal.toLocaleString()}</div>
			</div>
			<div className="bg-white p-5 rounded-md shadow-sm">
			<div className="text-xs text-gray-500">Commission Deducted</div>
			<div className="font-black text-xl text-red-500">-₦{commissionTotal.toLocaleString()}</div>
			</div>
			<div className="bg-white p-5 rounded-md shadow-sm">
			<div className="text-xs text-gray-500">Net Payout (You Get)</div>
			<div className="font-black text-xl text-green-600">₦{(cartTotal-commissionTotal).toLocaleString()}</div>
			</div>
			</div>
            <div className="bg-white rounded-md shadow-sm p-4">
			<div className="flex justify-between items-center">
			<h3 className="font-bold">My Products - Commission preview</h3>
			<button onClick={()=>{const t=prompt('Product title?'); if(t)setProducts([...products,{id:Date.now(),title:t,price:20000,oldPrice:30000,
			img:'https://picsum.photos/300',cat:'Fashion',vendor:'MyStore',rating:5,stock:10}])}} 
			className="bg-[#f68b1e] text-white px-4 py-1.5 rounded text-xs font-bold">+ ADD PRODUCT</button>
			</div>
			<table className="w-full text-sm mt-4"><thead className="text-xs text-gray-400 text-left">
			<tr>
			<th>Product</th>
			<th>Price</th>
			<th>Stock</th>
			<th>Commission</th>
			<th>You Keep</th>
			</tr>
			</thead>
			<tbody>{products.slice(0,6).map(p=>{const rate=COMMISSION_RATES[p.cat]||10; 
			return <tr key={p.id} className="border-t text-[13px]">
			<td className="py-2.5">{p.title}</td>
			<td>₦{p.price.toLocaleString()}</td>
			<td>{p.stock}</td>
			<td className="text-red-500">{rate}%</td>
			<td className="text-green-600 font-bold">₦{Math.round(p.price*(100-rate)/100).toLocaleString()}
			</td>
			</tr>
			})}
			</tbody>
			</table><
			/div>
          </div>
        </div>
      )}
      {view==='admin'&&(
        <div className="max-w-[1280px] mx-auto p-4 grid grid-cols-[250px_1fr] gap-4">
          <aside className="bg-black text-white rounded-md p-4 text-sm space-y-3 h-fit">
		  <h3 className="font-black">SUPER ADMIN</h3>
		  <div className="space-y-2 mt-3 text-[13px] opacity-80">
		  <div>📈 Overview</div>
		  <div>🏪 Vendors (6)</div>
		  <div>📦 Product Moderation</div>
		  <div>🧾 All Orders</div>
		  <div className="text-[#f68b1e] font-bold">💳 Payouts & Commission</div>
		  <div>👥 Customers</div>
		  </div>
		  </aside>
          <div className="space-y-4">
		  <div className="grid grid-cols-4 gap-4">
		  <div className="bg-white p-5 rounded-md shadow-sm">
		  <div className="text-xs text-gray-500">Platform GMV</div>
		  <div className="font-black text-xl">₦{(cartTotal*4).toLocaleString()}</div></div>
		  <div className="bg-white p-5 rounded-md shadow-sm border-l-4 border-[#f68b1e]">
		  <div className="text-xs text-gray-500">Commission Earned</div>
		  <div className="font-black text-xl text-[#f68b1e]">₦{commissionTotal.toLocaleString()}</div></div>
		  <div className="bg-white p-5 rounded-md shadow-sm">
		  <div className="text-xs text-gray-500">Active Vendors</div>
		  <div className="font-black text-xl">6 Verified</div>
		  </div>
		  <div className="bg-white p-5 rounded-md shadow-sm">
		  <div className="text-xs text-gray-500">Pending Payouts</div>
		  <div className="font-black text-xl">{cart.length} orders</div>
		  </div>
		  </div>
		  <div className="bg-white p-5 rounded-md shadow-sm">
		  <h3 className="font-bold mb-3">Commission Rules - Admin Controls (backend/config/commission.js)</h3>
		  <div className="grid grid-cols-3 gap-3 text-sm">{Object.entries(COMMISSION_RATES).map(([k,v])=>
		  <div key={k} className="border rounded-md p-3 flex justify-between items-center">
		  <span className="font-semibold">{k}</span>
		  <span className="bg-[#fef3e8] text-[#f68b1e] px-3 py-1 rounded-full font-bold text-xs">{v}%</span>
		  </div>
		  )
		  }
		  </div>
		  <div className="mt-4 text-xs bg-gray-50 p-3 rounded">
		  <b>Formula:</b> Vendor Payout = Order Total - (Total × Commission%) <br/>
		  <b>Stripe Flow:</b> PaymentIntent metadata = commissionTotal, vendorPayout → Webhook splits transfer to vendor.
		  </div>
		  </div>
		  </div>
        </div>
      )
	  } 
	  
	  
//showCart Section
      {showCart&&<div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
	  <div className="bg-white w-[420px] h-full p-5 overflow-auto">
	  <div className="flex justify-between font-black">CART ({cart.reduce((a,b)=>a+b.qty,0)}) 
	  <button onClick={()=>setShowCart(false)}>✕</button>
	  </div>
	  <div className="mt-5 space-y-4">{cart.length===0&&
	  <div className="text-sm text-gray-500">Cart empty</div>
	  }
	  {cart.map(i=><div key={i.id} className="flex gap-3 border-b pb-3">
	  <img src={i.img} className="w-16 h-16 object-cover rounded"/>
	  <div className="flex-1 text-sm">
	  <div className="text-[13px]">{i.title}</div>
	  <div className="font-bold">₦{i.price.toLocaleString()} × {i.qty}</div>
	  <div className="text-[11px] text-gray-400">
	  Commission {COMMISSION_RATES[i.cat]||10}% = ₦{Math.round(i.price*i.qty*0.1).toLocaleString()} → platform keeps
	  </div>
	  </div>
	  </div>
	  )
	  }
	  </div>
	  <div className="mt-6 text-sm space-y-2 border-t pt-4">
	  <div className="flex justify-between">
	  <span>Subtotal</span>
	  <span>₦{cartTotal.toLocaleString()}</span>
	  </div>
	  <div className="flex justify-between">
	  <span>Shipping</span>
	  <span>₦{shipping.toLocaleString()}</span>
	  </div>
	  <div className="flex justify-between text-[#f68b1e] font-bold">
	  <span>Platform Commission (deducted from vendor)</span>
	  <span>-₦{commissionTotal.toLocaleString()}</span>
	  </div>
	  <div className="flex justify-between font-black text-base border-t pt-2">
	  <span>Total to Pay (You)</span>
	  <span>₦{grandTotal.toLocaleString()}</span>
	  </div>
	  <div className="text-[11px] text-gray-500">Vendor receives ₦{(cartTotal-commissionTotal).toLocaleString()} after commission</div>
	  </div>
	  <button onClick={()=>{setShowCart(false);setShowCheckout(true)}} className="w-full bg-[#f68b1e] text-white py-3.5 rounded-md font-black mt-5">CHECKOUT WITH STRIPE →</button>
	  </div>
	  </div>
	  }
//Ends ShowCart Section
	  
	  
//ShowCheckout Checkout list Section
      {showCheckout&&<div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
	  <div className="bg-white rounded-xl w-[460px] p-6 shadow-2xl">
	  <div className="flex justify-between font-black text-lg">
	  Stripe Checkout 
	  <button onClick={()=>setShowCheckout(false)}>✕</button>
	  </div>
	  <div className="mt-1 text-[11px] bg-[#f0f6ff] border border-blue-100 p-2.5 rounded text-blue-800">
	  Backend ready: POST /api/checkout/create-payment-intent with STRIPE_SECRET_KEY in .env → returns clientSecret. Commission split in metadata.</div>
	  <div className="mt-4 space-y-3"><input placeholder="Card Number 4242 4242 4242 4242" className="w-full border rounded-md px-3 py-2.5 text-sm"/>
	  <div className="grid grid-cols-2 gap-3">
	  <input placeholder="MM/YY" className="border rounded-md px-3 py-2.5 text-sm"/>
	  <input placeholder="CVC" className="border rounded-md px-3 py-2.5 text-sm"/>
	  </div>
	  <div className="border rounded-md p-3 bg-gray-50 text-sm">
	  <div className="flex justify-between font-black">
	  <span>Pay Now</span>
	  <span>₦{grandTotal.toLocaleString()}</span>
	  </div>
	  <div className="text-[11px] text-gray-500 mt-1">Stripe test: 4242... | Vendor gets ₦{(cartTotal-commissionTotal).toLocaleString()}, 
	  Platform fee ₦{commissionTotal.toLocaleString()}
	  </div>
	  </div>
	  <button onClick={()=>{
		  alert('✅ Payment successful! Order created.\nVendor Payout: ₦'+(cartTotal-commissionTotal).toLocaleString()+'\nPlatform Commission: ₦'+commissionTotal.toLocaleString());
		  setCart([]);
		  setShowCheckout(false)}} className="w-full bg-black text-white py-3.5 rounded-md font-black">PAY ₦{grandTotal.toLocaleString()} - STRIPE
	  </button>
	  <div className="text-[10px] text-center text-gray-400 mt-2">Powered by Stripe • Test Mode • Secured by 3D Secure</div>
	  </div>
	  </div>
	  </div>
	  }
 //Ends ShowCheckout Section 

 
//Login section	  
	  {showLogin&&
	  <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
	  <form onSubmit={handleLogin} className="bg-white rounded-xl w-[400px] p-7 shadow-2xl">
	  <div className="flex justify-between font-black text-lg">
	  Welcome Back! <button type="button" onClick={()=>setShowLogin(false)}>✕</button>
	  </div>
	  <p className="text-[11px] text-gray-500 mt-1 bg-yellow-50 p-2 rounded">
	  Demo: customer@demo.com / vendor@demo.com / admin@demo.com | Pass: demo123
	  </p>
	  <input required value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="Email address" 
	  className="w-full mt-4 border rounded-md px-4 py-3 text-sm"/>
	  <input required type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} placeholder="Password" 
	  className="w-full mt-3 border rounded-md px-4 py-3 text-sm"/>
	  <button className="w-full bg-[#f68b1e] text-white py-3 rounded-md font-black mt-5 text-sm">LOGIN</button>
	  <div className="text-xs text-center mt-4">
	  Don't have an account? 
	  <span onClick={()=>{setShowLogin(false);setShowReg(true)}} className="text-[#f68b1e] font-bold cursor-pointer">Register</span>
	  </div>
	  </form>
	  </div>
	  }
//Ends Login Section

     
//Registeration section
	 {showReg&&
	  <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
	  <form onSubmit={handleReg} className="bg-white rounded-xl w-[420px] p-7 shadow-2xl">
	  <div className="flex justify-between font-black text-lg">
	  Create Account 
	  <button type="button" onClick={()=>setShowReg(false)}>✕</button>
	  </div>
	  <input required value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} placeholder="Full Name" className="w-full mt-4 border rounded-md px-4 py-3 text-sm"/>
	  <input required value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})} placeholder="Email" className="w-full mt-3 border rounded-md px-4 py-3 text-sm"/>
	  <input value={regForm.phone} onChange={e=>setRegForm({...regForm,phone:e.target.value})} placeholder="Phone (e.g. 080...)" className="w-full mt-3 border rounded-md px-4 py-3 text-sm"/>
	  <select value={regForm.role} onChange={e=>setRegForm({...regForm,role:e.target.value})} className="w-full mt-3 border rounded-md px-4 py-3 text-sm bg-white">
	  <option>Customer</option>
	  <option>Vendor</option>
	  </select>
	  <input required type="password" value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})} placeholder="Password (min 6)"
	  className="w-full mt-3 border rounded-md px-4 py-3 text-sm"/>
	  <button className="w-full bg-[#f68b1e] text-white py-3 rounded-md font-black mt-5 text-sm">
	  CREATE 
	  </button>
	  <div className="text-[11px] text-gray-400 mt-3 text-center">
	  By registering you agree to vendor commission rules. Platform takes {COMMISSION_RATES[regForm.role]||10}% per sale.
	  </div>
	  </form>
	  </div>}
    </div>
  )
}
//Ends Registration Section