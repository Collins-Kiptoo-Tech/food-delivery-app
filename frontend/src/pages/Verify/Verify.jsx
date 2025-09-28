import React, {useContext,useEffect} from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {

   const [searchParams,setSearchParams] = useSearchParams();
   const success = searchParams.get("success")
   const orderId = searchParams.get("orderId")
   console.log(success,orderId)
   const {url} = useContext(StoreContext);
   const navigate = useNavigate();

   useEffect(() => {
      const verifyPayment = async () => {
        try {
          const response = await axios.post(`${url}/api/order/verify`, { success, orderId });
          if (response.data.success) {
            navigate('/myorders'); // Redirect to home if successful
          } else {
            navigate('/'); // Handle failure (you can also show an error message)
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          // Handle error (you can also show an error message)
          navigate('/');
        }
      };
      if (success && orderId) {
         verifyPayment();
       }
     }, [success, orderId, url, navigate]);
 

  return (
    <div className='verify'>
       <div className='spinner'>

       </div>
    </div>
  )
}

export default Verify