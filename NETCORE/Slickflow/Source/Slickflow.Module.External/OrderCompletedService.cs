﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Slickflow.Data;
using Slickflow.Engine.Common;
using Slickflow.Engine.Delegate;

namespace Slickflow.Module.External
{
    public class OrderCompletedService : ExternalServiceBase, IExternalService
    {
        /// <summary>
        /// 业务逻辑前置调用方法
        /// </summary>
        public override void Execute()
        {
            //实现用户自己的业务逻辑
            var id = DelegateService.GetProcessInstanceID();
            DelegateService.SaveVariable(ProcessVariableTypeEnum.Process, "price", "1000");
            System.Diagnostics.Debug.WriteLine("order has been completed...");
        }
    }
}
