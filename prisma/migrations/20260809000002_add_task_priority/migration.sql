CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');
ALTER TABLE "Task" ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'medium';
