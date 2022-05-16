import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import useController from './DataVisualizationController';
import ChartLegend from './ChartLegend';
import XScale from './XScale';
import YScale from './YScale';
import Bars from './Bars';
import { sumBy, chain } from 'lodash';
import { Button, Spinner } from 'reactstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import { RETURN_LOCATION } from '../../shared/constants/data-visualization-configuration';
import { SelectWithPlaceholder } from '../common/form/withPlaceholder';
import { selectDefaultTheme } from '../../shared/util/form-util';
import { IGroupedDataByXAxis, IReportConfiguration, IReportData } from '../../shared/models/data-visualization';
import { IOption } from '../../shared/models/option';
import ChartDescription from './ChartDescription';
import ChartTitle from './ChartTitle';

interface IBarChart {
  isActive: boolean;
  report: IReportData[];
  config: IReportConfiguration;
}

const BarChart = ({
  isActive,
  report,
  config: { xAxis, yAxis, legend, description, chartType, colors, marginTop, marginBottom, marginLeft, marginRight, title }
}: IBarChart) => {
  const chartRef = useRef();
  const chartRefCurrent = chartRef.current as SVGAElement;
  const { formatMessage } = useIntl();

  const [dataToDisplay, setDataToDisplay] = useState<IGroupedDataByXAxis[]>([]);
  const [legendTypes, setLegendTypes] = useState<string[]>([]);
  const [xAsisTypes, setXAsisTypes] = useState<string[]>([]);
  const [filterByLegend, setFilterByLegend] = useState<string[]>([]);
  const [filterByXAxsis, setFilterByXAxsis] = useState<string[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(null);
  const [chartHeight, setChartHeight] = useState<number>(null);

  const groupData = useCallback(
    (data: IReportData[]) =>
      chain(data)
        .groupBy(xAxis)
        .map((xAxisValue: IReportData[], xAxisKey: string) => {
          const legendData = chain(xAxisValue)
            .groupBy(legend)
            .map((legendValue: IReportData[], legendKey: string) => {
              const legendSum = sumBy(legendValue, (data: IReportData) => data[yAxis]);

              return { legendSum, legendKey };
            })
            .value();

          return { xAxisKey, legendData };
        })
        .value() as IGroupedDataByXAxis[],
    [legend, xAxis, yAxis]
  );

  useEffect(() => {
    if (report?.length) {
      if (!legendTypes?.length) {
        const types = [...new Set(report.map(data => data[legend]))] as string[];

        setLegendTypes(types);
        setFilterByLegend(types);
      }

      if (!xAsisTypes?.length) {
        const types = [...new Set(report.map(data => data[xAxis]))] as string[];

        setXAsisTypes(types);
        setFilterByXAxsis(types);
      }
    }
  }, [legendTypes, xAsisTypes, report, legend, xAxis]);

  useEffect(() => {
    if (legendTypes?.length && xAsisTypes.length && !dataToDisplay?.length) {
      const groupedData = groupData(report);
      setDataToDisplay(groupedData);
    }
  }, [dataToDisplay, groupData, legendTypes, report, xAsisTypes]);

  useEffect(() => {
    if (dataToDisplay?.length && isActive) {
      const width = parseInt(d3.select('.chart').style('width')) - marginLeft - marginRight;
      const height = parseInt(d3.select('.chart').style('height')) - marginTop - marginBottom;

      setChartWidth(width);
      setChartHeight(height);
    }
  }, [dataToDisplay, isActive, marginBottom, marginLeft, marginRight, marginTop]);

  const controller = useController({
    data: dataToDisplay,
    chartWidth,
    chartHeight,
    chartType,
    xAxis,
    yAxis,
    legend,
    legendTypes,
    colors,
    marginLeft,
    marginTop
  });

  const { yScale, xScale, xSubgroup, colorsScaleOrdinal } = controller;

  const options = xAsisTypes.map(xAxisKey => ({ label: `${xAxisKey}`, value: `${xAxisKey}` }));

  const filterData = (xAxis: string[], legend = filterByLegend) => {
    const groupedData = groupData(report);
    const clonedDataToDisplay = !xAxis.length ? groupedData : groupedData.filter(({ xAxisKey }) => xAxis.includes(xAxisKey));

    const filteredDataToDisplay = clonedDataToDisplay
      .map(({ xAxisKey, legendData }) => ({
        xAxisKey,
        legendData: legendData.filter(({ legendKey }) => legend.includes(legendKey))
      }))
      .filter(({ legendData }) => legendData.length);

    setDataToDisplay(filteredDataToDisplay);
  };

  const handleOnChange = (options: IOption[]) => {
    const xAxisTypesFromOptions = options.map(({ value }) => value);

    filterData(xAxisTypesFromOptions, filterByLegend);
    setFilterByXAxsis(xAxisTypesFromOptions);
  };

  const handleLegendClick = (value: string) => {
    let clonedFilterByLegend = [...filterByLegend];

    if (clonedFilterByLegend.includes(value)) {
      clonedFilterByLegend = clonedFilterByLegend.filter(legend => legend !== value);
    } else {
      clonedFilterByLegend.push(value);
    }

    if (!clonedFilterByLegend.length) {
      clonedFilterByLegend = legendTypes;
    }

    filterData(filterByXAxsis, clonedFilterByLegend);
    setFilterByLegend(clonedFilterByLegend);
  };

  return (
    <div className="chart">
      {!xAsisTypes.length && !chartWidth ? (
        <div className="spinner">
          <Spinner />
        </div>
      ) : (
        <>
          <SelectWithPlaceholder
            placeholder={formatMessage({ id: 'dataVisualizationConfiguration.chart.xAxis' })}
            showPlaceholder={!!filterByXAxsis.length}
            options={options}
            onChange={handleOnChange}
            defaultValue={options}
            isMulti
            classNamePrefix="default-select"
            theme={selectDefaultTheme}
          />
          <svg width={chartWidth + marginLeft + marginRight} height={chartHeight + marginTop + marginBottom} ref={chartRef}>
            <ChartTitle chartRef={chartRefCurrent} chartWidth={chartWidth} marginTop={marginTop} title={title} />
            <YScale chartRef={chartRefCurrent} yScale={yScale} chartWidth={chartWidth} marginLeft={marginLeft} />
            <XScale chartRef={chartRefCurrent} xScale={xScale} chartHeight={chartHeight} chartType={chartType} data={dataToDisplay} />
            <ChartLegend
              legendTypes={legendTypes}
              filterByLegend={filterByLegend}
              handleLegendClick={handleLegendClick}
              colors={colorsScaleOrdinal}
              chartWidth={chartWidth}
              chartRef={chartRefCurrent}
              marginLeft={marginLeft}
              marginRight={marginRight}
            />
            <Bars
              chartRef={chartRefCurrent}
              dataToDisplay={dataToDisplay}
              xScale={xScale}
              yScale={yScale}
              xSubgroup={xSubgroup}
              colors={colorsScaleOrdinal}
              chartHeight={chartWidth}
            />
          </svg>
          {description && <ChartDescription description={description} />}
          <div className="mt-5 pb-5">
            <div className="d-inline">
              <Button className="cancel" onClick={() => (window.location.href = RETURN_LOCATION)}>
                <FormattedMessage id="common.return" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BarChart;
