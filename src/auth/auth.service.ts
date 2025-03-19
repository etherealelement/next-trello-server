import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./domain/dto/register-dto";
import { UserService } from "../user/user.service";
import { AuthMethod, User } from "../../prisma/__generated__";
import { Request, response } from "express";
import { LoginDto } from "./domain/dto/login-dto";
import { verify } from "argon2";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExist = await this.userService.findByEmail(dto.email);

    if (isExist) {
      throw new ConflictException(
        "Регистрация не удалась, пользователь с таким email уже существует.",
      );
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      AuthMethod.CREDENTIALS,
      "s",
      false,
    );

    return this.saveSession(req, newUser);
  }
  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException(
        "Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его",
      );
    }

    return this.saveSession(req, user);
  }
  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "Не удалось завершить сессию. Возможно возникла проблема с сервером или сессия уже была завершена",
            ),
          );
        }

        response.clearCookie(this.configService.getOrThrow("SESSION_NAME"));
        resolve();
      });
    });
  }

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "Не удалось сохранить сессию. Проверьте правильно ил настроены параметры сессии",
            ),
          );
        }

        resolve({
          user,
        });
      });
    });
  }
}
