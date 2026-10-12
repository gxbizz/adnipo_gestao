export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      pessoas: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          email: string | null;
          data_nascimento: string | null;
          status: "ATIVO" | "INATIVO";
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone?: string | null;
          email?: string | null;
          data_nascimento?: string | null;
          status?: "ATIVO" | "INATIVO";
          observacoes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pessoas"]["Insert"]>;
        Relationships: [];
      };
      grupos: {
        Row: {
          id: string;
          nome: string;
          tipo: "LOUVOR" | "ORQUESTRA" | "MINISTERIO" | "CORAL" | "OUTRO";
          descricao: string | null;
          responsavel_id: string | null;
          status: "ATIVO" | "INATIVO";
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          tipo: "LOUVOR" | "ORQUESTRA" | "MINISTERIO" | "CORAL" | "OUTRO";
          descricao?: string | null;
          responsavel_id?: string | null;
          status?: "ATIVO" | "INATIVO";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grupos"]["Insert"]>;
        Relationships: [];
      };
      grupo_membros: {
        Row: {
          id: string;
          pessoa_id: string;
          grupo_id: string;
          funcao: string | null;
          data_entrada: string | null;
          status: "ATIVO" | "INATIVO";
        };
        Insert: {
          id?: string;
          pessoa_id: string;
          grupo_id: string;
          funcao?: string | null;
          data_entrada?: string | null;
          status?: "ATIVO" | "INATIVO";
        };
        Update: Partial<Database["public"]["Tables"]["grupo_membros"]["Insert"]>;
        Relationships: [];
      };
      instrumentos: {
        Row: {
          id: string;
          nome: string;
          categoria: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["instrumentos"]["Insert"]>;
        Relationships: [];
      };
      membro_instrumentos: {
        Row: {
          id: string;
          grupo_membro_id: string;
          instrumento_id: string;
          nivel: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO" | null;
          principal: boolean;
        };
        Insert: {
          id?: string;
          grupo_membro_id: string;
          instrumento_id: string;
          nivel?: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO" | null;
          principal?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["membro_instrumentos"]["Insert"]>;
        Relationships: [];
      };
      eventos: {
        Row: {
          id: string;
          nome: string;
          data_hora: string;
          tipo: string | null;
          local: string | null;
          status: "AGENDADO" | "CANCELADO" | "CONCLUIDO";
        };
        Insert: {
          id?: string;
          nome: string;
          data_hora: string;
          tipo?: string | null;
          local?: string | null;
          status?: "AGENDADO" | "CANCELADO" | "CONCLUIDO";
        };
        Update: Partial<Database["public"]["Tables"]["eventos"]["Insert"]>;
        Relationships: [];
      };
      escalas: {
        Row: {
          id: string;
          evento_id: string;
          grupo_id: string;
        };
        Insert: {
          id?: string;
          evento_id: string;
          grupo_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["escalas"]["Insert"]>;
        Relationships: [];
      };
      escala_membros: {
        Row: {
          id: string;
          escala_id: string;
          pessoa_id: string;
          funcao: string | null;
          instrumento_id: string | null;
          status_confirmacao: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
        };
        Insert: {
          id?: string;
          escala_id: string;
          pessoa_id: string;
          funcao?: string | null;
          instrumento_id?: string | null;
          status_confirmacao?: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
        };
        Update: Partial<Database["public"]["Tables"]["escala_membros"]["Insert"]>;
        Relationships: [];
      };
      louvores: {
        Row: {
          id: string;
          nome: string;
          nome_normalizado: string;
          tipo_louvor: string | null;
          link_cifra: string | null;
          link_letra: string | null;
          tom: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          nome_normalizado: string;
          tipo_louvor?: string | null;
          link_cifra?: string | null;
          link_letra?: string | null;
          tom?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["louvores"]["Insert"]>;
        Relationships: [];
      };
      louvor_execucoes: {
        Row: {
          id: string;
          louvor_id: string;
          data_culto: string;
          tom: string | null;
          observacoes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          louvor_id: string;
          data_culto: string;
          tom?: string | null;
          observacoes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["louvor_execucoes"]["Insert"]>;
        Relationships: [];
      };
      escala_louvores: {
        Row: {
          id: string;
          escala_id: string;
          louvor_id: string;
          tom: string | null;
          ordem: number | null;
          observacoes: string | null;
        };
        Insert: {
          id?: string;
          escala_id: string;
          louvor_id: string;
          tom?: string | null;
          ordem?: number | null;
          observacoes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["escala_louvores"]["Insert"]>;
        Relationships: [];
      };
      escala_louvor_pessoas: {
        Row: {
          id: string;
          escala_louvor_id: string;
          pessoa_id: string;
          funcao: string | null;
        };
        Insert: {
          id?: string;
          escala_louvor_id: string;
          pessoa_id: string;
          funcao?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["escala_louvor_pessoas"]["Insert"]>;
        Relationships: [];
      };
      perfis_usuario: {
        Row: {
          id: string;
          user_id: string;
          pessoa_id: string | null;
          perfil: "ADMIN" | "LIDER" | "MEMBRO";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pessoa_id?: string | null;
          perfil?: "ADMIN" | "LIDER" | "MEMBRO";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfis_usuario"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
