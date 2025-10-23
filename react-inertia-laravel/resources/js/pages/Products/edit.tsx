
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/products';
import { update } from '@/routes/profile';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ProductsEdit',
        href: '/products/create',
    },
];

type Product = {
    id: number;
    name: string;
    price: string;
    description: string;
}

export default function Dashboard({ product }: {product: Product}) {
    const {data, setData, post, processing, errors} = useForm({
        name: product.name,
        price: product.price,
        description: product.description,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            post(update({ product: product.id }).toString());

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit - Product" />
            <div className="w-full p-4">
                <div className="w-7/12">
                    <h1 className='text-2xl font-bold mb-4'>Edit Product</h1>
                    <form action="border-1 border-gray-300 p-4" onSubmit={handleSubmit} method='POST'>
                        <div className="input-group mb-3">
                            <Label htmlFor='name'>Product Name</Label>
                            <Input type="text" name="name" className='mt-3' value={data.name} onChange={(e) => setData('name', e.target.value)}></Input>
                            {
                                errors.name && <small className='text-red-500'>{errors.name}</small>
                            }
                        </div>
                        <div className="input-group mb-3">
                            <Label htmlFor='price'>Price</Label>
                            <Input type="number" name="price" className='mt-3' value={data.price} onChange={(e) => setData('price', e.target.value)}></Input>
                            {
                                errors.price && <small className='text-red-500'>{errors.price}</small>
                            }
                        </div>
                        <div className="input-group mb-3">
                            <Label htmlFor='description'>Description</Label>
                            <Textarea name="description" className='mt-3' value={data.description} onChange={(e) => setData('description', e.target.value)}></Textarea>
                            {
                                errors.description && <small className='text-red-500'>{errors.description}</small>
                            }
                        </div>

                        <div className="">
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Update
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
