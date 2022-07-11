import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  console.log(req.cookies, req.cookies['poll-token']);

  if (req.cookies['poll-token']) return;

  const random = nanoid();

  // const res = NextResponse.redirect(req.nextUrl.clone());
  // res.cookie('poll-token', random, { sameSite: 'strict' });
  // return res;
}
