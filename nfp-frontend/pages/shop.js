import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Shop() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(null)
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
/*     async function fetchUser() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); */
      async function fetchProducts() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/1/`, {
/*           headers: {
            'Authorization': `Bearer ${token}`
          } */
        });
      if (res.status == 200) {
        const json = await res.json();
        console.log(json.products);
        setProducts(json.products);
        
      } else {
        router.push('login');
      }
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Shop</h1>
      <table>
      <tr key={"header"}>
        {products && Object.keys(products[0]).map((key) => (
          <th style={{border: "solid"}}>{key}</th>
        ))}
      </tr>
      {products && products.map((item) => (
        <tr key={item.id}>
          {Object.values(item).map((val) => (
            <td style={{border: "solid"}}>{val}</td>
          ))}
          <Button>Buy 1</Button>
          <button>Sell 1</button>
        </tr>
      ))}
      </table>
    </div>
  )
}