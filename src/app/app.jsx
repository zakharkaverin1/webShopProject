import React from 'react'
import ReactDOM from 'react-dom/client'
import ItemGallery from '../components/itemGallery/itemGallery.jsx'

const allItems = [
    { id: 1, title: 'iPhone 15', image: '/images/iphone15.jpg' },
    { id: 2, title: 'Samsung S24', image: '/images/samsung.jpg' },
    { id: 3, title: 'Google Pixel', image: '/images/pixel.jpg' },
    { id: 4, title: 'Xiaomi 14', image: '/images/xiaomi.jpg' },
    { id: 5, title: 'OnePlus 12', image: '/images/oneplus.jpg' },
    { id: 6, title: 'Sony Xperia', image: '/images/sony.jpg' },
    { id: 7, title: 'Iphone 16', image: '/images/oneplus.jpg' },
    { id: 8, title: 'Huawei', image: '/images/sony.jpg' }
]

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ItemGallery items={allItems} />
    </React.StrictMode>
)