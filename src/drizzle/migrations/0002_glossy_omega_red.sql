ALTER TABLE `orders` ADD `payment_status` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_amount` real;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_trade_no` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_time` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `updated_at` integer NOT NULL;