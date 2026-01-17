-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `otp` VARCHAR(191) NULL,
    `otp_expires_at` DATETIME(3) NULL,
    `username` VARCHAR(191) NULL,
    `email_verified_at` DATETIME(3) NULL,
    `password` VARCHAR(191) NULL,
    `remember_token` VARCHAR(191) NULL,
    `token_expires_at` DATETIME(3) NULL,
    `team_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boxes` (
    `id` VARCHAR(191) NOT NULL,
    `superadmin_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `domain` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `short_title` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL DEFAULT 'active',
    `phone` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `contact_name` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `country_id` VARCHAR(191) NULL,
    `state_id` VARCHAR(191) NULL,
    `city_id` VARCHAR(191) NULL,
    `daily_reminder_time` VARCHAR(191) NULL,
    `reminder_before` INTEGER NULL,
    `last_reminder_checked` DATETIME(3) NULL,
    `lead_required_field` TEXT NULL,
    `working_days` TEXT NULL,
    `day_start_time` VARCHAR(191) NULL,
    `day_end_time` VARCHAR(191) NULL,
    `currency_code` VARCHAR(191) NULL,
    `currency_symbol` VARCHAR(191) NULL,
    `leave_credit_mode` VARCHAR(191) NULL,
    `attendace_module_date` DATETIME(3) NULL,
    `attendace_module_from_date` DATETIME(3) NULL,
    `attendace_module_to_date` DATETIME(3) NULL,
    `leave_credit_time` VARCHAR(191) NULL,
    `start_day_of_every_month` INTEGER NULL,
    `last_day_of_every_month` INTEGER NULL,
    `leave_credit_selected_days` VARCHAR(191) NULL,
    `round_robin` BOOLEAN NULL DEFAULT false,
    `sms_enable` BOOLEAN NULL DEFAULT false,
    `sms_key` VARCHAR(191) NULL,
    `sms_contacts` VARCHAR(191) NULL,
    `sms_senderid` VARCHAR(191) NULL,
    `assigned_sms` BOOLEAN NULL,
    `assigned_sms_text` TEXT NULL,
    `round_robin_users` TEXT NULL,
    `dynamic_employee_id` BOOLEAN NULL,
    `change_dynamic_prefix` VARCHAR(191) NULL,
    `custom_employee_id` VARCHAR(191) NULL,
    `params` TEXT NULL,
    `can_use_admin_mail` BOOLEAN NULL,
    `admin_mail_users` TEXT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `notification` BOOLEAN NULL,
    `bulk_lead_assignment` BOOLEAN NULL,
    `lead_assignment` BOOLEAN NULL,
    `change_lead_assigned_if_admin` BOOLEAN NULL,
    `change_lead_status_if_admin` BOOLEAN NULL,
    `change_lead_source_if_admin` BOOLEAN NULL,
    `activity_reminder` BOOLEAN NULL,
    `allow_duplicate_leads` BOOLEAN NULL,
    `whatsapp_enable` BOOLEAN NULL,
    `whatsapp_business_id` VARCHAR(191) NULL,
    `whatsapp_phone_id` VARCHAR(191) NULL,
    `whatsapp_token` VARCHAR(191) NULL,
    `auto_task_close` BOOLEAN NULL,
    `auto_task_close_days` INTEGER NULL,
    `facebook_api_params` TEXT NULL,
    `company_email` VARCHAR(191) NULL,
    `company_phone` VARCHAR(191) NULL,
    `fax_number` VARCHAR(191) NULL,
    `company_logo` VARCHAR(191) NULL,
    `relaxation_time` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `boxes_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `box_users` (
    `id` VARCHAR(191) NOT NULL,
    `box_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `added_by` VARCHAR(191) NULL,
    `email_connected` BOOLEAN NULL,
    `email_type` VARCHAR(191) NULL,
    `email_incoming_user` VARCHAR(191) NULL,
    `email_incoming_password` VARCHAR(191) NULL,
    `email_outgoing_user` VARCHAR(191) NULL,
    `email_outgoing_password` VARCHAR(191) NULL,
    `email_same_user` BOOLEAN NULL,
    `email_incoming` VARCHAR(191) NULL,
    `email_incoming_port` VARCHAR(191) NULL,
    `email_outgoing` VARCHAR(191) NULL,
    `email_outgoing_port` VARCHAR(191) NULL,
    `email_allow_non_secure_certificate` BOOLEAN NULL,
    `encryption` VARCHAR(191) NULL,
    `email_token` VARCHAR(191) NULL,
    `email_refresh_token` VARCHAR(191) NULL,
    `allowed_ips` TEXT NULL,
    `signature` TEXT NULL,
    `exlude_ip_restriction` BOOLEAN NULL,
    `auto_responder` BOOLEAN NULL,
    `auto_responder_text` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `pf_no` VARCHAR(191) NULL,
    `esi_no` VARCHAR(191) NULL,
    `resignation_date` DATETIME(3) NULL,
    `working_days` VARCHAR(191) NULL,
    `day_start_time` VARCHAR(191) NULL,
    `day_end_time` VARCHAR(191) NULL,
    `last_lead` DATETIME(3) NULL,
    `exclude_round_robin` BOOLEAN NULL,
    `user_box_timing` TEXT NULL,
    `gmail_app` BOOLEAN NULL,
    `status` VARCHAR(191) NULL,
    `auto_responser_subject` VARCHAR(191) NULL,
    `error_log` TEXT NULL,
    `auto_responder_attachments` TEXT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `reporting_manager_id` VARCHAR(191) NULL,
    `can_login_anytime` BOOLEAN NULL,
    `report_office` VARCHAR(191) NULL,
    `about` TEXT NULL,
    `company` VARCHAR(191) NULL,
    `pan_number` VARCHAR(191) NULL,
    `employee_id` VARCHAR(191) NULL,
    `staff_role` VARCHAR(191) NULL,
    `joining_date` DATETIME(3) NULL,
    `marriage_date` DATETIME(3) NULL,
    `department` VARCHAR(191) NULL,
    `shift_id` VARCHAR(191) NULL,
    `work_mode_id` VARCHAR(191) NULL,
    `working_web_days` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `assign_tour` BOOLEAN NULL,
    `assign_customer` BOOLEAN NULL,
    `gender` VARCHAR(191) NULL,
    `birthday` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `passport_no` VARCHAR(191) NULL,
    `profile_image_path` VARCHAR(191) NULL,
    `passport_exp_date` DATETIME(3) NULL,
    `nationality` VARCHAR(191) NULL,
    `religion` VARCHAR(191) NULL,
    `marital_status` VARCHAR(191) NULL,
    `Employment_of_spouse` VARCHAR(191) NULL,
    `no_of_children` INTEGER NULL,
    `relaxation_time` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `dialing_code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` VARCHAR(191) NOT NULL,
    `country_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL DEFAULT 'active',
    `code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` VARCHAR(191) NOT NULL,
    `state_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL DEFAULT 'active',
    `lat` VARCHAR(191) NULL,
    `lng` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_superadmin_id_fkey` FOREIGN KEY (`superadmin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `box_users` ADD CONSTRAINT `box_users_box_id_fkey` FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `box_users` ADD CONSTRAINT `box_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `states` ADD CONSTRAINT `states_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
