import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, company, jobTitle, bio } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, company, jobTitle, bio },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
