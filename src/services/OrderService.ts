import axios from 'axios';
import { OrderDTO } from '../dtos/order/order.dto';
import { OrderResponse } from '../responses/order/order.response';
import { UpdateStatusOrderDTO } from '../dtos/order/update.status.order.dto';
import useFetchWithAuthUser from '../fetch/FetchUser';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; // hoặc process.env nếu dùng CRA
const apiUrl = `${API_BASE_URL}/orders`;

const OrderService = {
  placeOrder: async (orderData: OrderDTO) => {
    return await axios.post(`${apiUrl}`, orderData);
  },

  getOrderById: async (orderId: number) => {
    const response = await axios.get(`${apiUrl}/${orderId}`);
    return response.data;
  },

  getOrderByIdWithToken: async (orderId: number, token: string) => {
    const response = await axios.get(`${apiUrl}/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOrderDetailWithToken: async (orderId: number, token: string) => {
    const response = await axios.get(`${apiUrl}/order-detail/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOrderByUser: async (
    fullName: string,
    phoneNumber: string,
    email: string,
    orderDate: string,
    status: string,
    active: boolean,
    page: number,
    limit: number
  ) => {

    const fetchWithAuth = useFetchWithAuthUser();

    return await fetchWithAuth(`/orders/orders-of-client`, {
      method: "POST",
      params: {
        fullName,
        phoneNumber,
        email,
        orderDate,
        status,
        active,
        page,
        limit,
      },
    });
  },

  getAllOrders: async (
    fullName: string,
    phoneNumber: string,
    email: string,
    orderDate: string,
    status: string,
    active: boolean,
    page: number,
    limit: number
  ): Promise<OrderResponse[]> => {
    const response = await axios.get(`${apiUrl}`, {
      params: {
        fullName,
        phoneNumber,
        email,
        orderDate,
        status,
        active,
        page,
        limit,
      },
    });
    return response.data;
  },

  updateOrder: async (orderId: number, orderData: OrderDTO) => {
    const response = await axios.put(`${apiUrl}/${orderId}`, orderData);
    return response.data;
  },

  updateStatus: async (orderId: number, orderData: UpdateStatusOrderDTO) => {
    const response = await axios.put(`${apiUrl}/update-status/${orderId}`, orderData);
    return response.data;
  },

  deleteOrder: async (orderId: number) => {
    const response = await axios.delete(`${apiUrl}/${orderId}`, {
      responseType: 'text',
    });
    return response.data;
  },
};

export default OrderService;
