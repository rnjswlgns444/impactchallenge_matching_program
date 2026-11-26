// 서버만 쓰는 자료: AI 지시문과 모델 설정.
// 화면 쪽('use client') 코드에서 이 파일을 가져오면 빌드가 멈춘다.
import "server-only";

import raw from "@/generated/server.json";

import type { ServerData } from "./types";

export const serverData = raw as ServerData;
