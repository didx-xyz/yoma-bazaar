import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { type FieldValues, Controller, useForm } from "react-hook-form";
import zod from "zod";
import type {
  OpportunityCategory,
  OpportunitySearchCriteriaCommitmentInterval,
  OpportunitySearchFilter,
  OpportunitySearchCriteriaZltoReward,
  OpportunityType,
} from "~/api/models/opportunity";
import type { Country, Language, SelectOption } from "~/api/models/lookups";
import Select, { components, type ValueContainerProps } from "react-select";
import type { OrganizationInfo } from "~/api/models/organisation";
import { OpportunityCategoryHorizontalCard } from "./OpportunityCategoryHorizontalCard";
import iconNextArrow from "public/images/icon-next-arrow.svg";
import { toBase64, shimmer } from "~/lib/image";
import Image from "next/image";

export interface InputProps {
  htmlRef: HTMLDivElement;
  opportunitySearchFilter: OpportunitySearchFilter | null;
  lookups_categories: OpportunityCategory[];
  lookups_countries: Country[];
  lookups_languages: Language[];
  lookups_types: OpportunityType[];
  lookups_organisations: OrganizationInfo[];
  lookups_commitmentIntervals: OpportunitySearchCriteriaCommitmentInterval[];
  lookups_zltoRewardRanges: OpportunitySearchCriteriaZltoReward[];
  onSubmit?: (fieldValues: OpportunitySearchFilter) => void;
  onClear?: () => void;
  onOpenFilterFullWindow?: () => void;
  clearButtonText?: string;
}

const ValueContainer = ({
  children,
  ...props
}: ValueContainerProps<SelectOption>) => {
  // eslint-disable-next-line prefer-const
  let [values, input] = children as any[];
  if (Array.isArray(values)) {
    const plural = values.length === 1 ? "" : "s";
    values = `${values.length} item${plural}`;
  }

  return (
    <components.ValueContainer {...props}>
      {values}
      {input}
    </components.ValueContainer>
  );
};

export const OpportunityFilterHorizontal: React.FC<InputProps> = ({
  htmlRef,
  opportunitySearchFilter,
  lookups_categories,
  lookups_countries,
  lookups_languages,
  lookups_types,
  lookups_organisations,
  lookups_commitmentIntervals,
  lookups_zltoRewardRanges,
  onSubmit,
  onClear,
  onOpenFilterFullWindow,
  clearButtonText = "Clear",
}) => {
  const schema = zod.object({
    types: zod.array(zod.string()).optional().nullable(),
    categories: zod.array(zod.string()).optional().nullable(),
    languages: zod.array(zod.string()).optional().nullable(),
    countries: zod.array(zod.string()).optional().nullable(),
    organizations: zod.array(zod.string()).optional().nullable(),
    commitmentIntervals: zod.array(zod.string()).optional().nullable(),
    zltoRewardRanges: zod.array(zod.string()).optional().nullable(),
  });

  const form = useForm({
    mode: "all",
    resolver: zodResolver(schema),
  });
  const { handleSubmit, formState, reset } = form;

  // set default values
  useEffect(() => {
    if (opportunitySearchFilter == null || opportunitySearchFilter == undefined)
      return;

    // reset form
    // setTimeout is needed to prevent the form from being reset before the default values are set
    setTimeout(() => {
      reset({
        ...opportunitySearchFilter,
      });
    }, 100);
  }, [reset, opportunitySearchFilter]);

  // form submission handler
  const onSubmitHandler = useCallback(
    (data: FieldValues) => {
      if (onSubmit) onSubmit(data as OpportunitySearchFilter);
    },
    [onSubmit],
  );

  const onClickCategoryFilter = useCallback(
    (cat: OpportunityCategory) => {
      if (!opportunitySearchFilter || !onSubmit) return;

      const prev = { ...opportunitySearchFilter };
      prev.categories = prev.categories ?? [];

      if (prev.categories.includes(cat.id)) {
        prev.categories = prev.categories.filter((x) => x !== cat.id);
      } else {
        prev.categories.push(cat.name);
      }

      onSubmit(prev);
    },
    [opportunitySearchFilter, onSubmit],
  );

  return (
    <div className="flex flex-grow flex-col">
      {lookups_categories && lookups_categories.length > 0 && (
        <div className="flex-col items-center justify-center gap-2 pb-8">
          <div className="flex justify-center gap-2">
            <div className="flex gap-2 overflow-hidden md:w-[800px]">
              {lookups_categories.map((item) => (
                <OpportunityCategoryHorizontalCard
                  key={item.id}
                  data={item}
                  selected={opportunitySearchFilter?.categories?.includes(
                    item.name,
                  )}
                  onClick={onClickCategoryFilter}
                />
              ))}
            </div>
            {/* VIEW ALL: OPEN FILTERS */}
            <button
              type="button"
              onClick={onOpenFilterFullWindow}
              className="flex h-[140px] w-[140px] flex-col items-center rounded-lg bg-white p-2"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center">
                  <Image
                    src={iconNextArrow}
                    alt="Icon View All"
                    width={60}
                    height={60}
                    sizes="100vw"
                    priority={true}
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(
                      shimmer(288, 182),
                    )}`}
                    style={{
                      width: "60px",
                      height: "60px",
                    }}
                  />
                </div>

                <div className="flex flex-grow flex-row">
                  <div className="flex flex-grow flex-col gap-1">
                    <h1 className="h-10 overflow-hidden text-ellipsis text-center text-sm font-semibold text-black">
                      View all
                      <br />
                      Topics
                    </h1>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmitHandler)} // eslint-disable-line @typescript-eslint/no-misused-promises
        className="flex flex-col gap-2"
      >
        <div className="flex flex-row gap-2">
          <div className="mr-4 flex items-center text-sm font-bold text-gray-dark">
            Filter by:
          </div>
          <div className="">
            <Controller
              name="types"
              control={form.control}
              defaultValue={opportunitySearchFilter?.countries}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_types.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_types
                    .filter((c) => value?.includes(c.name))
                    .map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Type"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />

            {formState.errors.types && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.types.message}`}
                </span>
              </label>
            )}
          </div>
          <div className="">
            <Controller
              name="countries"
              control={form.control}
              defaultValue={opportunitySearchFilter?.countries}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_countries.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_countries
                    .filter((c) => value?.includes(c.name))
                    .map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Location"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />
            {formState.errors.countries && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.countries.message}`}
                </span>
              </label>
            )}
          </div>
          <div className="">
            <Controller
              name="languages"
              control={form.control}
              defaultValue={opportunitySearchFilter?.languages}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_languages.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_languages
                    .filter((c) => value?.includes(c.name))
                    .map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Language"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />

            {formState.errors.languages && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.languages.message}`}
                </span>
              </label>
            )}
          </div>
          <div className="">
            <Controller
              name="organizations"
              control={form.control}
              defaultValue={opportunitySearchFilter?.organizations}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_organisations.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_organisations
                    .filter((c) => value?.includes(c.name))
                    .map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Organisation"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />

            {formState.errors.organizations && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.organizations.message}`}
                </span>
              </label>
            )}
          </div>

          <div className="">
            <Controller
              name="commitmentIntervals"
              control={form.control}
              defaultValue={opportunitySearchFilter?.commitmentIntervals}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_commitmentIntervals.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_commitmentIntervals
                    .filter((c) => value?.includes(c.id))
                    .map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Effort"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />
            {formState.errors.commitmentIntervals && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.commitmentIntervals.message}`}
                </span>
              </label>
            )}
          </div>

          <div className="">
            <Controller
              name="zltoRewardRanges"
              control={form.control}
              defaultValue={opportunitySearchFilter?.zltoRewardRanges}
              render={({ field: { onChange, value } }) => (
                <Select
                  classNames={{
                    control: () => "input input-bordered input-xs",
                  }}
                  isMulti={true}
                  options={lookups_zltoRewardRanges.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  // fix menu z-index issue
                  menuPortalTarget={htmlRef}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(val) => {
                    onChange(val.map((c) => c.value));
                    void handleSubmit(onSubmitHandler)();
                  }}
                  value={lookups_zltoRewardRanges
                    .filter((c) => value?.includes(c.id))
                    .map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Reward"
                  components={{
                    ValueContainer,
                  }}
                />
              )}
            />

            {formState.errors.zltoRewardRanges && (
              <label className="label font-bold">
                <span className="label-text-alt italic text-red-500">
                  {`${formState.errors.zltoRewardRanges.message}`}
                </span>
              </label>
            )}
          </div>

          <div className="flex items-center text-xs text-gray-dark">
            <button type="button" onClick={onClear}>
              {clearButtonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};