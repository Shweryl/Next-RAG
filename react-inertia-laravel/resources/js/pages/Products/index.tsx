
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create, edit } from '@/routes/products';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

type Product = {
    id: number;
    name: string;
    price: string;
    description: string;
}

type DashboardProps = {
    products: Product[];
};

export default function Dashboard({ products }: DashboardProps) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${id}`);
        }
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product" />
            <div className="w-full p-4">
                <Link href={create()}>
                    <Button> Create </Button>
                </Link>
                <hr className='my-4' />
                <div className="w-10/12">
                    <Table>
                        <TableCaption>A list of your recent invoices.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Id</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products && products.map((product) => (
                                <TableRow>
                                    <TableCell className="font-medium">{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>
                                        <Link href={edit(product.id)}>
                                            <Button>Edit</Button>
                                        </Link>
                                        <Button onClick={() => handleDelete(product.id)} className='ml-2'>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))

                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
