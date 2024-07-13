import { useState, useEffect } from 'react';
import { Copy, QrCode, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import formatPrice from '@/utils/formatPrice';
import useCreate from '@/hooks/useCreate';
import { toast } from '../ui/use-toast';
import { Input } from '../ui/input';
import DialogQrcode from './DialogQrcode';

interface DialogCarrinhoProps {
  cartItems: any[];
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function DialogCarrinho({ cartItems, setCartItems }: DialogCarrinhoProps) {
  const userId = localStorage.getItem('userId');
  const [total, setTotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [payload, setPayload] = useState({});
  const [posted, setPosted] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token);
  }, []);

  useEffect(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, [setCartItems]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    const newTotal = cartItems.reduce((acc, item) => acc + item.PRODUCT_PRICE * item.PRODUCT_QUANTITY, 0);
    setTotal(newTotal);
  }, [cartItems]);

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prevCartItems => prevCartItems.filter(item => item._id !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCartItems(prevCartItems =>
      prevCartItems.map(item =>
        item._id === productId ? { ...item, PRODUCT_QUANTITY: quantity } : item
      )
    );
  };

  const handleQuantityDecrease = (productId: string) => {
    setCartItems(prevCartItems =>
      prevCartItems.map(item =>
        item._id === productId ? { ...item, PRODUCT_QUANTITY: Math.max(1, item.PRODUCT_QUANTITY - 1) } : item
      )
    );
  };

  const handleQuantityIncrease = (productId: string) => {
    setCartItems(prevCartItems =>
      prevCartItems.map(item =>
        item._id === productId ? { ...item, PRODUCT_QUANTITY: Math.min(99, item.PRODUCT_QUANTITY + 1) } : item
      )
    );
  };

  const handleSubmit = () => {
    const payload = {
      CART_USER_ID: userId,
      CART_PRODUCT: cartItems.map(item => ({
        PRODUCT_ID: item._id,
        PRODUCT_QUANTITY: item.PRODUCT_QUANTITY,
      })),
    };
    setPayload(payload);
    setPosted(true);
  };

  const { isPosted, isPosting, error, error409 } = useCreate(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/create`, payload, posted, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  useEffect(() => {
    if (error409) {
      setPosted(false);
      toast({
        title: error409?.error,
        description: error409?.message
      });
    }
    if (error) {
      setPosted(false);
      toast({
        title: error.error,
        description: error.message
      });
    }
    if (isPosted) {
      setPosted(false);
      localStorage.removeItem('cartItems');
      setTotalFinal(total)
      setCartItems([]);
      toast({
        title: "Compra finalizada",
        description: "A compra foi realizada com sucesso."
      });
    }
  }, [error, error409, isPosted, setCartItems]);

  if (isPosted) {
    return (
      <DialogContent onCloseAutoFocus={() => { window.location.reload() }} className="w-[28rem] max-w-[90vw]">
        <DialogQrcode price={formatPrice(totalFinal)}/>
      </DialogContent>
    )
  }

  const rows = cartItems.map((item: any) => (
    <TableRow key={item._id}>
      <TableCell className="text-end md:table-cell w-10 pr-0">
        <div className="flex items-center">
          <Button
            onClick={() => handleQuantityDecrease(item._id)}
            size="icon"
            className="h-4 w-4 shrink-0 rounded-full"
          >
            <Minus className="h-2.5 w-2.5" />
          </Button>
          <Input
            type="text"
            value={item.PRODUCT_QUANTITY}
            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
            className="text-center border-0 p-0 w-6 mx-1"
            min={1}
            max={99}

          />
          <Button
            onClick={() => handleQuantityIncrease(item._id)}
            size="icon"
            className="h-4 w-4 shrink-0 rounded-full"
          >
            <Plus className="h-2.5 w-2.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="font-medium">{item.PRODUCT_NAME}</div>
        <div className="text-sm text-muted-foreground md:inline">{formatPrice(item.PRODUCT_PRICE)}</div>
      </TableCell>
      <TableCell className="text-end pl-0">
        <div className="flex justify-end">
          <Trash2 className='cursor-pointer' onClick={() => handleRemoveFromCart(item._id)} size={20} color="red" />
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <DialogContent className="w-[30rem] max-w-[90vw]">
      <DialogHeader>
        <DialogTitle className="text-center">Meu carrinho</DialogTitle>
        <DialogDescription className="text-center">
          Edite tudo antes de finalizar a compra
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[60vh] w-full">
        <Table>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </ScrollArea>
      <DialogFooter className="h-[10vh] flex flex-col justify-center items-center">
        <div className="w-full mb-2 text-center">
          <span>Total: {formatPrice(total)}</span>
          <Button className="w-full mt-4" disabled={total <= 0} onClick={handleSubmit}>Finalizar compra</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}