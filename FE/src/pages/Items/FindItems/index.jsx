//// Mất đồ
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// function FindItems() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/items?status=approved')
//       .then(res => setItems(res.data))
//       .catch(err => console.log(err));
//   }, []);

//   return (
//     <div>
//       {items.map(item => <div key={item.id}>{item.name}</div>)}
//     </div>
//   );
// }