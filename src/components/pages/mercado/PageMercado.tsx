import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CirclePlus, ListFilter, Search, ShoppingCart } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DialogCarrinho from '@/components/dialogCarrinho/DialogCarrinho';
import formatPrice from '@/utils/formatPrice';

interface Produto {
  _id: string;
  PRODUCT_NAME: string;
  PRODUCT_CATEGORY: string;
  PRODUCT_QUANTITY: number;
  PRODUCT_PRICE: number;
}

interface Categoria {
  _id: string;
  CATEGORY_NAME: string;
}

interface PageMercadoProps {
  produtos: Produto[];
  categorias: Categoria[];
}

export default function PageMercado({ produtos, categorias }: PageMercadoProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Produto[]>(() => {
    const storedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    return storedCartItems;
  });
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    const totalCount = cartItems.reduce((acc, item) => acc + item.PRODUCT_QUANTITY, 0);
    setCartItemCount(totalCount);
  }, [cartItems]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = (produto: Produto) => {
    const existingItem = cartItems.find(item => item._id === produto._id);
    if (existingItem) {
      const updatedItems = cartItems.map(item =>
        item._id === produto._id ? { ...item, PRODUCT_QUANTITY: item.PRODUCT_QUANTITY + 1 } : item
      );
      setCartItems(updatedItems);
    } else {
      const newCartItem = { ...produto, PRODUCT_QUANTITY: 1 };
      setCartItems([...cartItems, newCartItem]);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProdutos = produtos.filter((produto: Produto) => {
    const matchesCategory = selectedCategory ? produto.PRODUCT_CATEGORY === selectedCategory : true;
    const matchesSearchTerm = produto.PRODUCT_NAME.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  const rows = filteredProdutos.map((produto: Produto) => (
    <TableRow key={produto._id}>
      <TableCell className="font-medium">
        <div className="font-medium">{produto.PRODUCT_NAME}</div>
        <div className="text-sm text-muted-foreground md:inline">{formatPrice(produto.PRODUCT_PRICE)}</div>
      </TableCell>
      <TableCell className="text-end hidden md:table-cell">{produto.PRODUCT_CATEGORY}</TableCell>
      <TableCell className="text-end">{produto.PRODUCT_QUANTITY} Un.</TableCell>
      <TableCell className="text-end">
        <Button size="sm" className="gap-1" onClick={() => handleAddToCart(produto)}>
          <CirclePlus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Comprar
          </span>
        </Button>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <main className="flex flex-col gap-4 p-4 lg:gap-2 lg:p-6 lg:pb-0">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Mercado</h1>
        </div>
        <div className="flex flex-1 justify-center rounded-lg border-0 shadow-sm" x-chunk="dashboard-02-chunk-1">
          <Tabs className="w-full" defaultValue="all">
            <div className="flex items-center">
              <div className="relative mr-5 flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Categorias
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                    <DropdownMenuLabel>Filtrar por categoria</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      className="cursor-pointer"
                      onSelect={() => handleCategorySelect(null)}
                      checked={selectedCategory === null}
                    >
                      Todos
                    </DropdownMenuCheckboxItem>
                    {categorias.map((categoria: Categoria) => (
                      <DropdownMenuCheckboxItem
                        className="cursor-pointer"
                        key={categoria._id}
                        onSelect={() => handleCategorySelect(categoria.CATEGORY_NAME)}
                        checked={selectedCategory === categoria.CATEGORY_NAME}
                      >
                        {categoria.CATEGORY_NAME}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1 relative">
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
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0" className="border-0">
                <CardContent className="flex flex-1 flex-col p-0">
                  <ScrollArea className="h-[63vh] w-full">
                    {produtos && produtos.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted hover:bg-muted">
                            <TableHead className='w-2/5 md:w-[40%]'>Nome</TableHead>
                            <TableHead className="w-1/5 md:w-[20%] text-end hidden md:table-cell">Categoria</TableHead>
                            <TableHead className="w-1/5 md:w-[20%] text-end">Dispon.</TableHead>
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
                            <TableHead className='flex flex-col justify-center items-center'>Produtos</TableHead>
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
                  <div className="flex justify-center mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-3/5 md:w-[40%] gap-1" disabled={!cartItemCount}>
                          <span>
                            Finalizar compra
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogCarrinho cartItems={cartItems} setCartItems={setCartItems} />
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}