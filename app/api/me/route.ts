import { NextResponse } from "next/server";
import connect from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/lib/modals/users";
import Admin from "@/lib/modals/admins";

const NEXT_PUBLIC_JWT_SECRET = '4ubRjQbEkhu/vAmtPRKNNCRelPNdc9+5C6+eIiqd/Vs=';

if (!NEXT_PUBLIC_JWT_SECRET) {
  throw new Error("NEXT_PUBLIC_JWT_SECRET is not defined. Please set it in your environment variables.");
}

// Определяем интерфейс для декодированного токена
interface DecodedToken {
  id: string;
  role: 'admin' | 'user';
}

// Проверка JWT токена и его декодирование
const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, NEXT_PUBLIC_JWT_SECRET) as DecodedToken; // Явное приведение к интерфейсу
  } catch (error) {
    console.error(error);
    return null; // Если токен невалидный, возвращаем null
  }
};

// GET запрос: получаем информацию о текущем пользователе или администраторе
export const GET = async (request: Request) => {
  try {
    await connect(); // Устанавливаем соединение с базой данных

    // Получаем токен из заголовков
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new NextResponse(JSON.stringify({ message: "Требуется аутентификация!" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // Извлекаем токен
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return new NextResponse(JSON.stringify({ message: "Неверный токен!" }), { status: 403 });
    }

    // В зависимости от роли пользователя, получаем соответствующие данные
    let userInfo;
    if (decodedToken.role === 'admin') {
      // Получаем информацию об администраторе
      userInfo = await Admin.findById(decodedToken.id).select('-password'); // Исключаем пароль
    } else if (decodedToken.role === 'user') {
      // Получаем информацию о пользователе
      userInfo = await User.findById(decodedToken.id).select('-password'); // Исключаем пароль
    } else {
      return new NextResponse(JSON.stringify({ message: "Роль пользователя не определена!" }), { status: 403 });
    }

    // Если пользователь или администратор не найден
    if (!userInfo) {
      return new NextResponse(JSON.stringify({ message: "Пользователь не найден!" }), { status: 404 });
    }

    // Возвращаем информацию о пользователе или администраторе
    return new NextResponse(JSON.stringify(userInfo), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse('ERROR: ' + error.message, { status: 500 });
    }
    return new NextResponse('ERROR: An unknown error occurred', { status: 500 });
  }
};

// Добавляем обработчик OPTIONS для поддержки preflight-запросов
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // или указанный домен
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
