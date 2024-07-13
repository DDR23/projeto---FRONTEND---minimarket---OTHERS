import DialogCarrinho from "@/components/dialogCarrinho/DialogCarrinho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Activity, MoreHorizontal, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface Produto {
  PRODUCT_ID: string;
  PRODUCT_QUANTITY: number;
  _id: string;
}

interface Compra {
  _id: string;
  CART_USER_ID: string;
  CART_PRODUCT: {
    PRODUCT_ID: string;
    PRODUCT_QUANTITY: number;
    _id: string;
  }[];
  CART_PRICE: number;
  CART_STATUS: 'active' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Stats {
  activeCount: number;
  completedCount: number;
  canceledCount: number;
  totalCompletedValue: number;
  totalActiveValue: number;
  totalTransactions: number;
}

interface PagesPainelProps {
  compras: Compra[] | null;
  stats: Stats;
}

const statusMap: { [key: string]: { label: string, color: string } } = {
  active: { label: 'Pendente', color: 'bg-orange-400' },
  completed: { label: 'Concluída', color: 'bg-green-500' },
  canceled: { label: 'Cancelada', color: 'bg-red-500' }
};

function getStatusLabelAndClass(status: string) {
  return statusMap[status] || { label: 'Desconhecido', color: 'bg-gray-500' };
}

export default function PagePainel({ compras, stats }: PagesPainelProps) {
  const [cartItems, setCartItems] = useState<Produto[]>(() => {
    const storedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    return storedCartItems;
  });
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    const totalCount = cartItems.reduce((acc, item) => acc + item.PRODUCT_QUANTITY, 0);
    setCartItemCount(totalCount);
  }, [cartItems]);

  const rows = compras?.map((compra: Compra) => (
    <TableRow key={compra._id}>
      <TableCell className="font-medium">
        <div className="text-sm text-muted-foreground">Ordem #{compra._id}</div>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusLabelAndClass(compra.CART_STATUS).color} md:hidden`} />
          <span className="text-sm">{formatPrice(compra.CART_PRICE)}</span>
        </div>
      </TableCell>
      <TableCell className="text-end hidden md:table-cell">{formatDate(compra.createdAt)}</TableCell>
      <TableCell className="text-end hidden md:table-cell">
        <div className="flex items-center justify-end">
          <span className="text-sm mr-2">{getStatusLabelAndClass(compra.CART_STATUS).label}</span>
          <div className={`w-2 h-2 rounded-full ml-1 ${getStatusLabelAndClass(compra.CART_STATUS).color}`} />
        </div>
      </TableCell>
      <TableCell className="text-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <a href={`/compra/${compra._id}`}>
              <DropdownMenuItem className="cursor-pointer">
                Detalhes
              </DropdownMenuItem>
            </a>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Meu painel</h1>
        </div>
        <div className="flex flex-1 rounded-lg shadow-sm" x-chunk="dashboard-02-chunk-1">
          <div className="grid w-full auto-rows-max items-start gap-6 md:gap-6 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
              <Card x-chunk="dashboard-01-chunk-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resumo da conta</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats.totalCompletedValue)}<span className="text-sm font-normal text-muted-foreground"> em compras</span></div>
                  <div className="text-sm text-muted-foreground">+ {formatPrice(stats.totalActiveValue)} em compras pendetes</div>
                  <div className="text-sm text-muted-foreground">{stats.totalTransactions} compras ao todo</div>
                  <div className='border-t-[1px] mt-4 pt-4'>
                    <div className="text-sm text-muted-foreground">{stats.completedCount} Compras concluídas</div>
                    <div className="text-sm text-muted-foreground">{stats.activeCount} Compras pendentes</div>
                    <div className="text-sm text-muted-foreground">{stats.canceledCount} Compras canceladas</div>
                  </div>
                  <div className='border-t-[1px] mt-4 pt-4 flex flex-row justify-between'>
                    <div>
                      <div className="text-sm font-bold">Meu carrinho</div>
                      <div className="text-sm text-muted-foreground">Você tem {cartItemCount} itens no carrinho</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button disabled={!cartItemCount} size="sm" className="gap-1 relative">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Carrinho
                          </span>
                          {cartItemCount > 0 && (
                            <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center">
                              {cartItemCount}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogCarrinho cartItems={cartItems} setCartItems={setCartItems} />
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <div className="text-lg font-semibold md:text-2xl pb-4">Ultimas compras</div>
              <ScrollArea className="h-[45vh]">
                {compras && compras.length > 0 ? (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className='w-3/5 md:w-[40%]'>Compra</TableHead>
                        <TableHead className="w-1/5 md:w-[20%] text-end hidden md:table-cell">Data</TableHead>
                        <TableHead className="w-1/5 md:w-[20%] text-end hidden md:table-cell">Status</TableHead>
                        <TableHead className='w-1/5 md:w-[20%]'>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows}
                    </TableBody>
                  </Table>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className='flex flex-col justify-center items-center'>Compras</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="h-[30vh] flex flex-col justify-center items-center">
                            <h1 className="text-lg font-semibold md:text-2xl">Vázio</h1>
                            <p className="text-sm text-muted-foreground md:inline">Nada por aqui..</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}