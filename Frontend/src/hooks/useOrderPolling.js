import { useEffect, useRef, useCallback } from 'react';
import useOrderStore from '../store/orderStore';

const TERMINAL_STATUSES = ['completed', 'cancelled'];
const POLL_INTERVAL = 5000;

const useOrderPolling = (orderId) => {
  const intervalRef = useRef(null);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const pollOrderStatus = useOrderStore((s) => s.pollOrderStatus);
  const pollRef = useRef(pollOrderStatus);
  pollRef.current = pollOrderStatus;
  const statusRef = useRef(activeOrder?.status);
  statusRef.current = activeOrder?.status;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    pollRef.current(orderId);

    intervalRef.current = setInterval(() => {
      if (TERMINAL_STATUSES.includes(statusRef.current)) {
        stopPolling();
        return;
      }
      pollRef.current(orderId);
    }, POLL_INTERVAL);

    return stopPolling;
  }, [orderId, stopPolling]);

  return activeOrder;
};

export default useOrderPolling;
