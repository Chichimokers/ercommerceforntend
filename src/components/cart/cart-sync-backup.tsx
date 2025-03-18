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
        }

        else if (!localCart && cookieCart) {
          localStorage.setItem('cart', cookieCart);
        }

        else if (localCart && cookieCart && localCart !== cookieCart) {
          Cookies.set('cart', localCart, {
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
        }
      } catch (error) {
      }
    };

    checkAndSync();

    const interval = setInterval(checkAndSync, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}