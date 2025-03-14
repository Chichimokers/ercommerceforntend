"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function CartSyncBackup() {
  useEffect(() => {
    const checkAndSync = () => {
      try {
        const localCart = localStorage.getItem('cart');

        const cookieCart = Cookies.get('cart');

        if (localCart && !cookieCart) {
          Cookies.set('cart', localCart, {
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
          console.log('Carrito sincronizado: localStorage → cookie');
        }

        else if (!localCart && cookieCart) {
          localStorage.setItem('cart', cookieCart);
          console.log('Carrito sincronizado: cookie → localStorage');
        }

        else if (localCart && cookieCart && localCart !== cookieCart) {
          Cookies.set('cart', localCart, {
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
          console.log('Carrito re-sincronizado: localStorage → cookie (diferencias)');
        }
      } catch (error) {
        console.error('Error en sincronización de respaldo:', error);
      }
    };

    checkAndSync();

    const interval = setInterval(checkAndSync, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}